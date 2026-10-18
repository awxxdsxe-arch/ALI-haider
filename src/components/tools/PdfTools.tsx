import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  Layers,
  Scissors,
  Minimize2,
  FileImage,
  FileCheck,
  RotateCw,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PdfTools: React.FC<{ toolId: string }> = ({ toolId }) => {
  const { language } = useApp();
  const isUrdu = language === 'ur';

  // Common state
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('processed.pdf');

  // Specific state for Merge
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  // Specific state for Single PDF tools (Split, Compress, Extract, Rotate)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [splitRange, setSplitRange] = useState<string>('1-2');
  const [extractPagesInput, setExtractPagesInput] = useState<string>('1');
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [rotateAll, setRotateAll] = useState<boolean>(true);
  const [rotateSpecificPages, setRotateSpecificPages] = useState<string>('1');

  // Specific state for Images to PDF
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4'>('a4');

  // Compression stats
  const [compressedStats, setCompressedStats] = useState<{ originalSize: number; newSize: number } | null>(null);

  const resetState = () => {
    setStatusMessage(null);
    setDownloadUrl(null);
    setCompressedStats(null);
  };

  // Helper: Inspect page count of single PDF
  const handleSinglePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setStatusMessage({ type: 'error', text: isUrdu ? 'براہ کرم درست پی ڈی ایف فائل منتخب کریں۔' : 'Please select a valid PDF file.' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: isUrdu ? 'فائل کا سائز 50 ایم بی سے کم ہونا چاہیے۔' : 'File exceeds 50MB browser safe limit.' });
      return;
    }

    try {
      setSelectedFile(file);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPageCount(count);
      setSplitRange(`1-${Math.min(count, 2)}`);
      setExtractPagesInput(`1`);
      setRotateSpecificPages(`1`);
      setStatusMessage({
        type: 'info',
        text: isUrdu ? `فائل لوڈ ہو گئی: ${count} صفحات دریافت ہوئے۔` : `Document loaded: ${count} page${count > 1 ? 's' : ''} detected.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: isUrdu ? 'پی ڈی ایف فائل لوڈ کرنے میں دشواری پیش آئی۔ فائل پاس ورڈ سے محفوظ ہو سکتی ہے۔' : 'Failed to read PDF. It might be password-protected or corrupted.',
      });
    }
  };

  // 1. MERGE PDF FILES
  const handleMergeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (newFiles.length === 0) {
      setStatusMessage({ type: 'error', text: isUrdu ? 'براہ کرم پی ڈی ایف فائلیں منتخب کریں۔' : 'No valid PDF files selected.' });
      return;
    }
    setMergeFiles((prev) => [...prev, ...newFiles]);
  };

  const createPdfBlob = (bytes: Uint8Array): Blob => {
    return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  };

  const executeMerge = async () => {
    if (mergeFiles.length < 2) {
      setStatusMessage({ type: 'error', text: isUrdu ? 'براہ کرم جوڑنے کے لیے کم از کم 2 فائلیں منتخب کریں۔' : 'Please select at least 2 PDF files to merge.' });
      return;
    }

    setIsProcessing(true);
    resetState();

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < mergeFiles.length; i++) {
        const file = mergeFiles[i];
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = createPdfBlob(mergedBytes);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(`merged_document_${Date.now()}.pdf`);
      setStatusMessage({
        type: 'success',
        text: isUrdu ? `کامیابی! کل ${mergeFiles.length} فائلیں یکجا ہو گئیں۔` : `Success! ${mergeFiles.length} files successfully merged into one.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: isUrdu ? 'فائلیں جوڑنے میں خرابی پیش آئی۔' : 'Error merging PDFs: ' + (err.message || 'Unknown error') });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. SPLIT PDF FILES
  const executeSplit = async () => {
    if (!selectedFile || !pageCount) return;
    setIsProcessing(true);
    resetState();

    try {
      const bytes = await selectedFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const splitDoc = await PDFDocument.create();

      // Parse range e.g. "1-3" or "2,4"
      const ranges = splitRange.split(',').map((r) => r.trim());
      const pageIndicesToInclude = new Set<number>();

      for (const r of ranges) {
        if (r.includes('-')) {
          const [startStr, endStr] = r.split('-');
          const start = Math.max(1, parseInt(startStr, 10));
          const end = Math.min(pageCount, parseInt(endStr, 10));
          for (let p = start; p <= end; p++) {
            pageIndicesToInclude.add(p - 1);
          }
        } else {
          const single = parseInt(r, 10);
          if (!isNaN(single) && single >= 1 && single <= pageCount) {
            pageIndicesToInclude.add(single - 1);
          }
        }
      }

      const sortedIndices = Array.from(pageIndicesToInclude).sort((a, b) => a - b);
      if (sortedIndices.length === 0) {
        throw new Error(isUrdu ? 'براہ کرم درست پیج رینج درج کریں۔' : 'Invalid page range specified.');
      }

      const pages = await splitDoc.copyPages(srcDoc, sortedIndices);
      pages.forEach((p) => splitDoc.addPage(p));

      const outBytes = await splitDoc.save();
      const blob = createPdfBlob(outBytes);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(`split_${splitRange.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`);
      setStatusMessage({
        type: 'success',
        text: isUrdu ? `کامیابی! صفحات الگ کر لیے گئے۔ کل ${sortedIndices.length} صفحات محفوظ ہوئے۔` : `Success! Created new PDF containing ${sortedIndices.length} selected pages.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to split PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. COMPRESS / OPTIMIZE PDF
  const executeCompress = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    resetState();

    try {
      const bytes = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(bytes);

      // Clean unneeded metadata to shrink overhead
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setProducer('Ali Haider All-in-One Helper');
      doc.setCreator('Ali Haider');

      // Re-save with object stream compression
      const compressedBytes = await doc.save({ useObjectStreams: true });
      const blob = createPdfBlob(compressedBytes);
      const url = URL.createObjectURL(blob);

      setCompressedStats({
        originalSize: selectedFile.size,
        newSize: compressedBytes.byteLength,
      });

      setDownloadUrl(url);
      setDownloadFilename(`optimized_${selectedFile.name}`);
      setStatusMessage({
        type: 'success',
        text: isUrdu ? 'دستاویز کی ساخت کو کامیابی سے بہتر بنا دیا گیا۔' : 'Document structure and metadata successfully optimized.',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Optimization failed: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. IMAGES TO PDF
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      setStatusMessage({ type: 'error', text: isUrdu ? 'براہ کرم تصاویر منتخب کریں۔' : 'Please select valid image files (JPG, PNG, WebP).' });
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
  };

  const executeImagesToPdf = async () => {
    if (imageFiles.length === 0) {
      setStatusMessage({ type: 'error', text: isUrdu ? 'براہ کرم کم از کم ایک تصویر منتخب کریں۔' : 'Please upload at least one image.' });
      return;
    }
    setIsProcessing(true);
    resetState();

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imgFile of imageFiles) {
        // Convert to canvas to get standard PNG buffer regardless of input (JPEG, WebP, PNG)
        const imageBitmap = await createImageBitmap(imgFile);
        const canvas = document.createElement('canvas');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(imageBitmap, 0, 0);

        const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!pngBlob) continue;
        const pngBytes = await pngBlob.arrayBuffer();
        const embeddedImage = await pdfDoc.embedPng(pngBytes);

        if (pageSize === 'a4') {
          // Standard A4: 595 x 842 points
          const a4Width = 595.28;
          const a4Height = 841.89;
          const page = pdfDoc.addPage([a4Width, a4Height]);

          const scale = Math.min((a4Width - 40) / embeddedImage.width, (a4Height - 40) / embeddedImage.height);
          const drawW = embeddedImage.width * scale;
          const drawH = embeddedImage.height * scale;
          const drawX = (a4Width - drawW) / 2;
          const drawY = (a4Height - drawH) / 2;

          page.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH,
          });
        } else {
          // Fit image native dimensions
          const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: embeddedImage.width,
            height: embeddedImage.height,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = createPdfBlob(pdfBytes);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(`images_converted_${Date.now()}.pdf`);
      setStatusMessage({
        type: 'success',
        text: isUrdu ? `کامیابی! کل ${imageFiles.length} تصاویر پی ڈی ایف میں تبدیل ہو گئیں۔` : `Success! ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} converted into PDF.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error converting images to PDF: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. EXTRACT PAGES
  const executeExtract = async () => {
    if (!selectedFile || !pageCount) return;
    setIsProcessing(true);
    resetState();

    try {
      const bytes = await selectedFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();

      // Parse comma or dash separated list
      const parts = extractPagesInput.split(',').map((s) => s.trim());
      const selected = new Set<number>();

      for (const p of parts) {
        if (p.includes('-')) {
          const [s, e] = p.split('-');
          const start = Math.max(1, parseInt(s, 10));
          const end = Math.min(pageCount, parseInt(e, 10));
          for (let i = start; i <= end; i++) selected.add(i - 1);
        } else {
          const num = parseInt(p, 10);
          if (!isNaN(num) && num >= 1 && num <= pageCount) {
            selected.add(num - 1);
          }
        }
      }

      const indices = Array.from(selected).sort((a, b) => a - b);
      if (indices.length === 0) {
        throw new Error(isUrdu ? 'براہ کرم نکالنے کے لیے درست صفحات منتخب کریں۔' : 'No valid pages selected.');
      }

      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach((cp) => newDoc.addPage(cp));

      const outBytes = await newDoc.save();
      const blob = createPdfBlob(outBytes);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(`extracted_pages_${Date.now()}.pdf`);
      setStatusMessage({
        type: 'success',
        text: isUrdu ? `کامیابی! ${indices.length} صفحات کامیابی سے نکال لیے گئے۔` : `Extracted ${indices.length} page${indices.length > 1 ? 's' : ''} into a new document.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Extract failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. ROTATE PAGES
  const executeRotate = async () => {
    if (!selectedFile || !pageCount) return;
    setIsProcessing(true);
    resetState();

    try {
      const bytes = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();

      if (rotateAll) {
        pages.forEach((p) => {
          const curr = p.getRotation().angle;
          p.setRotation(degrees((curr + rotationAngle) % 360));
        });
      } else {
        // Specific pages
        const parts = rotateSpecificPages.split(',').map((s) => s.trim());
        const selected = new Set<number>();
        for (const p of parts) {
          const num = parseInt(p, 10);
          if (!isNaN(num) && num >= 1 && num <= pageCount) {
            selected.add(num - 1);
          }
        }
        selected.forEach((idx) => {
          if (pages[idx]) {
            const curr = pages[idx].getRotation().angle;
            pages[idx].setRotation(degrees((curr + rotationAngle) % 360));
          }
        });
      }

      const outBytes = await doc.save();
      const blob = createPdfBlob(outBytes);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(`rotated_${Date.now()}.pdf`);
      setStatusMessage({
        type: 'success',
        text: isUrdu ? 'صفحات کو کامیابی کے ساتھ گھما دیا گیا۔' : `Successfully rotated document pages by ${rotationAngle}°.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Rotation failed: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Privacy guarantee banner */}
      <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-xl text-emerald-900 dark:text-emerald-200 text-sm">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="font-semibold">{isUrdu ? '100% نجی اور محفوظ' : '100% Client-Side Private'}</p>
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            {isUrdu
              ? 'یہ تمام پروسیسنگ براہ راست آپ کے براؤزر کے اندر ہوتی ہے۔ آپ کے دستاویزات کبھی کسی سرور پر اپلوڈ نہیں ہوتے۔'
              : 'PDF processing is performed locally inside your device browser via WebAssembly. Your files are never uploaded to any remote server.'}
          </p>
        </div>
      </div>

      {/* TOOL 1: MERGE PDF */}
      {toolId === 'pdf-merge' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'پی ڈی ایف فائلیں یکجا کریں' : 'Merge Multiple PDF Files'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'متعدد دستاویزات اپلوڈ کریں اور ایک نئی مشترکہ فائل بنائیں' : 'Select two or more PDF files in the order you want them combined.'}
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl p-8 text-center transition cursor-pointer relative bg-stone-50/50 dark:bg-stone-950/50">
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleMergeUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-10 h-10 mx-auto text-stone-400 mb-2" />
            <p className="font-medium text-stone-800 dark:text-stone-200">
              {isUrdu ? 'فائلیں منتخب کریں یا یہاں ڈریگ کریں' : 'Click to select or drag & drop PDF files'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {isUrdu ? 'تائید شدہ: معیاری پی ڈی ایف' : 'Supported: standard PDF documents (Max 50MB per file)'}
            </p>
          </div>

          {mergeFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                {isUrdu ? `منتخب کردہ فائلیں (${mergeFiles.length})` : `Selected Documents (${mergeFiles.length})`}:
              </h4>
              <div className="space-y-2">
                {mergeFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-stone-100 dark:bg-stone-800/60 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-700 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="text-xs text-stone-400">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      onClick={() => setMergeFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setMergeFiles([])}
                  className="text-xs text-stone-500 hover:underline"
                >
                  {isUrdu ? 'فہرست صاف کریں' : 'Clear all files'}
                </button>
                <button
                  disabled={isProcessing || mergeFiles.length < 2}
                  onClick={executeMerge}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {isUrdu ? 'جوڑا جا رہا ہے...' : 'Merging PDFs...'}
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      {isUrdu ? 'ابھی جوڑیں' : 'Merge Files Now'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 2: SPLIT PDF */}
      {toolId === 'pdf-split' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'پی ڈی ایف تقسیم کریں' : 'Split PDF Document'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'صفحات کے مخصوص سلسلے کو الگ کر کے نئی فائل بنائیں' : 'Specify page numbers or ranges to create a separate document.'}
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center relative bg-stone-50/50 dark:bg-stone-950/50">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleSinglePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p className="font-medium text-stone-800 dark:text-stone-200">
              {selectedFile ? selectedFile.name : (isUrdu ? 'پی ڈی ایف منتخب کریں' : 'Click to select a PDF to split')}
            </p>
            {pageCount !== null && (
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {isUrdu ? `کل صفحات: ${pageCount}` : `Total Pages: ${pageCount}`}
              </p>
            )}
          </div>

          {selectedFile && pageCount && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {isUrdu ? 'صفحات کی رینج (مثلاً 1-3 یا 1, 4, 7)' : 'Page Range (e.g. 1-3 or 1, 4, 5)'}
                </label>
                <input
                  type="text"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  placeholder="e.g. 1-3"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
                />
                <p className="text-xs text-stone-500 mt-1">
                  {isUrdu
                    ? `اس دستاویز میں 1 سے لے کر ${pageCount} تک صفحات ہیں۔`
                    : `Specify single pages or hyphenated ranges within 1 to ${pageCount}.`}
                </p>
              </div>

              <button
                disabled={isProcessing}
                onClick={executeSplit}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isUrdu ? 'تقسیم ہو رہا ہے...' : 'Splitting Document...'}
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    {isUrdu ? 'نئی فائل بنائیں' : 'Split & Download Selected Pages'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: COMPRESS PDF */}
      {toolId === 'pdf-compress' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Minimize2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'پی ڈی ایف سائز کم اور آپٹمائز کریں' : 'Compress & Optimize PDF'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'دستاویز کے اندر غیر ضروری میٹا ڈیٹا اور ڈیٹا اسٹریمز کی اصلاح' : 'Rebuild document object streams and remove unneeded metadata.'}
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center relative bg-stone-50/50 dark:bg-stone-950/50">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleSinglePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p className="font-medium text-stone-800 dark:text-stone-200">
              {selectedFile ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})` : (isUrdu ? 'پی ڈی ایف منتخب کریں' : 'Click to select a PDF to optimize')}
            </p>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <button
                disabled={isProcessing}
                onClick={executeCompress}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isUrdu ? 'آپٹمائز کیا جا رہا ہے...' : 'Optimizing PDF Stream...'}
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    {isUrdu ? 'سائز کم اور آپٹمائز کریں' : 'Optimize & Compress Document'}
                  </>
                )}
              </button>

              {compressedStats && (
                <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">{isUrdu ? 'اصل سائز:' : 'Original Size:'}</span>
                    <span className="font-mono font-medium">{formatFileSize(compressedStats.originalSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{isUrdu ? 'نیا سائز:' : 'Optimized Size:'}</span>
                    <span className="font-mono font-semibold text-emerald-600">{formatFileSize(compressedStats.newSize)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: IMAGES TO PDF */}
      {toolId === 'pdf-images-to-pdf' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <FileImage className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'تصاویر سے پی ڈی ایف بنائیں' : 'Convert Images to PDF'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'جے پی جی، پی این جی یا ویب پی تصاویر کو معیاری پی ڈی ایف میں تبدیل کریں' : 'Convert multiple JPG, PNG, and WebP images into a single clean PDF.'}
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-8 text-center relative bg-stone-50/50 dark:bg-stone-950/50">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleImagesUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-10 h-10 mx-auto text-stone-400 mb-2" />
            <p className="font-medium text-stone-800 dark:text-stone-200">
              {isUrdu ? 'تصاویر منتخب کریں یا ڈریگ کریں' : 'Click to select or drag & drop images'}
            </p>
            <p className="text-xs text-stone-500 mt-1">Supports JPG, PNG, WebP</p>
          </div>

          {imageFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {imageFiles.length} {isUrdu ? 'تصاویر منتخب ہوئیں' : 'images selected'}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="text-stone-500">{isUrdu ? 'صفحے کا لے آؤٹ:' : 'Layout:'}</label>
                  <select
                    value={pageSize}
                    onChange={(e: any) => setPageSize(e.target.value)}
                    className="border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-2 py-1 rounded-lg text-xs"
                  >
                    <option value="a4">{isUrdu ? 'معیاری اے فور (A4)' : 'Standard A4'}</option>
                    <option value="fit">{isUrdu ? 'تصویر کا اصل سائز' : 'Fit to image dimensions'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {imageFiles.map((f, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 aspect-square bg-stone-100">
                    <img
                      src={URL.createObjectURL(f)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                disabled={isProcessing}
                onClick={executeImagesToPdf}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isUrdu ? 'پی ڈی ایف بنائی جا رہی ہے...' : 'Creating PDF Document...'}
                  </>
                ) : (
                  <>
                    <FileImage className="w-4 h-4" />
                    {isUrdu ? 'پی ڈی ایف بنائیں اور ڈاؤنلوڈ کریں' : 'Generate & Download PDF'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TOOL 5: EXTRACT PAGES */}
      {toolId === 'pdf-extract' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'مخصوص صفحات نکالیں' : 'Extract PDF Pages'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'کسی بھی بڑی دستاویز سے منتخب صفحات نکال کر الگ فائل بنائیں' : 'Extract only the exact pages you need into a new PDF document.'}
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center relative bg-stone-50/50 dark:bg-stone-950/50">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleSinglePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p className="font-medium text-stone-800 dark:text-stone-200">
              {selectedFile ? `${selectedFile.name} (${pageCount} pages)` : (isUrdu ? 'پی ڈی ایف منتخب کریں' : 'Click to select a PDF')}
            </p>
          </div>

          {selectedFile && pageCount && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {isUrdu ? 'کون سے صفحات نکالنے ہیں؟ (مثلاً 1, 3, 5 یا 2-4)' : 'Pages to Extract (e.g. 1, 3, 5 or 2-4):'}
                </label>
                <input
                  type="text"
                  value={extractPagesInput}
                  onChange={(e) => setExtractPagesInput(e.target.value)}
                  placeholder="e.g. 1, 3, 5"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
                />
              </div>

              <button
                disabled={isProcessing}
                onClick={executeExtract}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isUrdu ? 'صفحات نکالے جا رہے ہیں...' : 'Extracting Pages...'}
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    {isUrdu ? 'صفحات نکال کر محفوظ کریں' : 'Extract & Download Pages'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TOOL 6: ROTATE PAGES */}
      {toolId === 'pdf-rotate' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <RotateCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'پی ڈی ایف صفحات گھمائیں' : 'Rotate PDF Pages'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'الٹے یا ٹیڑھے صفحات کو 90°، 180° یا 270° درست کریں' : 'Correct document orientation by rotating pages in 90-degree increments.'}
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center relative bg-stone-50/50 dark:bg-stone-950/50">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleSinglePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p className="font-medium text-stone-800 dark:text-stone-200">
              {selectedFile ? `${selectedFile.name} (${pageCount} pages)` : (isUrdu ? 'پی ڈی ایف منتخب کریں' : 'Click to select a PDF to rotate')}
            </p>
          </div>

          {selectedFile && pageCount && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  {isUrdu ? 'گھمانے کا زاویہ:' : 'Rotation Angle:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setRotationAngle(deg)}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition cursor-pointer ${
                        rotationAngle === deg
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {deg}° Clockwise
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={rotateAll}
                      onChange={() => setRotateAll(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isUrdu ? 'تمام صفحات' : 'All Pages'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!rotateAll}
                      onChange={() => setRotateAll(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isUrdu ? 'صرف مخصوص صفحات' : 'Specific Pages Only'}</span>
                  </label>
                </div>

                {!rotateAll && (
                  <input
                    type="text"
                    value={rotateSpecificPages}
                    onChange={(e) => setRotateSpecificPages(e.target.value)}
                    placeholder="e.g. 1, 3"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
                  />
                )}
              </div>

              <button
                disabled={isProcessing}
                onClick={executeRotate}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isUrdu ? 'گھمایا جا رہا ہے...' : 'Rotating Document...'}
                  </>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4" />
                    {isUrdu ? 'روٹیٹ کر کے محفوظ کریں' : `Rotate by ${rotationAngle}° & Download`}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* STATUS AND DOWNLOAD NOTIFICATIONS */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
            statusMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
              : statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
              : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          )}
          <div className="flex-1">
            <p>{statusMessage.text}</p>
          </div>
        </div>
      )}

      {/* DOWNLOAD BUTTON */}
      {downloadUrl && (
        <div className="p-4 bg-emerald-500 text-white rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">
              {isUrdu ? 'آپ کی نئی فائل تیار ہے!' : 'Your processed file is ready!'}
            </span>
          </div>
          <a
            href={downloadUrl}
            download={downloadFilename}
            className="px-4 py-2 bg-white text-emerald-800 hover:bg-stone-100 rounded-lg font-bold text-sm flex items-center gap-2 shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            {isUrdu ? 'ڈاؤنلوڈ کریں' : 'Download PDF'}
          </a>
        </div>
      )}
    </div>
  );
};
