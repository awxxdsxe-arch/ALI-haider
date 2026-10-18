import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize,
  Zap,
  Crop,
  RefreshCw,
  Compass,
  Upload,
  Download,
  Lock,
  Unlock,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ImageTools: React.FC<{ toolId: string }> = ({ toolId }) => {
  const { language } = useApp();
  const isUrdu = language === 'ur';

  // Common file state
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Resize state
  const [resizeWidth, setResizeWidth] = useState<number>(800);
  const [resizeHeight, setResizeHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Compress state
  const [compressionQuality, setCompressionQuality] = useState<number>(75);

  // Crop state
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '4:3' | '16:9'>('free');
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 100, height: 100 });

  // Convert state
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');

  // Rotate state
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // UI state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification({ type: 'error', text: isUrdu ? 'براہ کرم درست تصویر منتخب کریں۔' : 'Please select a valid image (JPG, PNG, WebP).' });
      return;
    }

    setSourceFile(file);
    setOriginalSize(file.size);
    setNotification(null);
    setProcessedUrl(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImagePreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setSourceImage(img);
        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setResizeWidth(img.naturalWidth);
        setResizeHeight(img.naturalHeight);
        setCropBox({
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Keep aspect ratio during resize input
  const handleWidthChange = (val: number) => {
    setResizeWidth(val);
    if (lockAspectRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setResizeHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setResizeHeight(val);
    if (lockAspectRatio && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setResizeWidth(Math.round(val * ratio));
    }
  };

  const applyPresetScale = (factor: number) => {
    if (!originalDimensions.width) return;
    const w = Math.round(originalDimensions.width * factor);
    const h = Math.round(originalDimensions.height * factor);
    setResizeWidth(w);
    setResizeHeight(h);
  };

  // 1. EXECUTE RESIZE
  const executeResize = () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = resizeWidth;
      canvas.height = resizeHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      // High quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(sourceImage, 0, 0, resizeWidth, resizeHeight);

      const mime = sourceFile?.type || 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Export failed');
          setProcessedSize(blob.size);
          setProcessedUrl(URL.createObjectURL(blob));
          setNotification({
            type: 'success',
            text: isUrdu
              ? `تصویر کو ${resizeWidth}x${resizeHeight} پکسلز پر کامیابی سے تبدیل کر دیا گیا۔`
              : `Image successfully resized to ${resizeWidth}x${resizeHeight}px.`,
          });
          setIsProcessing(false);
        },
        mime,
        0.92
      );
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
      setIsProcessing(false);
    }
  };

  // 2. EXECUTE COMPRESS
  const executeCompress = () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = sourceImage.naturalWidth;
      canvas.height = sourceImage.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(sourceImage, 0, 0);

      // JPEG or WebP can be compressed using quality param
      const mime = sourceFile?.type === 'image/png' ? 'image/jpeg' : (sourceFile?.type || 'image/jpeg');
      const qualityFactor = compressionQuality / 100;

      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Compression failed');
          setProcessedSize(blob.size);
          setProcessedUrl(URL.createObjectURL(blob));
          const savings = Math.max(0, Math.round(((originalSize - blob.size) / originalSize) * 100));
          setNotification({
            type: 'success',
            text: isUrdu
              ? `تصویر کا سائز ${savings}% کم ہو گیا (${formatFileSize(originalSize)} سے ${formatFileSize(blob.size)})۔`
              : `Compressed successfully! Reduced by ${savings}% (${formatFileSize(originalSize)} → ${formatFileSize(blob.size)}).`,
          });
          setIsProcessing(false);
        },
        mime,
        qualityFactor
      );
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
      setIsProcessing(false);
    }
  };

  // 3. EXECUTE CROP
  const executeCrop = () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      let targetW = cropBox.width;
      let targetH = cropBox.height;

      // Handle aspect ratio crops
      if (cropAspect === '1:1') {
        const side = Math.min(sourceImage.naturalWidth, sourceImage.naturalHeight);
        targetW = side;
        targetH = side;
      } else if (cropAspect === '4:3') {
        targetW = sourceImage.naturalWidth;
        targetH = Math.round(sourceImage.naturalWidth * (3 / 4));
        if (targetH > sourceImage.naturalHeight) {
          targetH = sourceImage.naturalHeight;
          targetW = Math.round(targetH * (4 / 3));
        }
      } else if (cropAspect === '16:9') {
        targetW = sourceImage.naturalWidth;
        targetH = Math.round(sourceImage.naturalWidth * (9 / 16));
        if (targetH > sourceImage.naturalHeight) {
          targetH = sourceImage.naturalHeight;
          targetW = Math.round(targetH * (16 / 9));
        }
      }

      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      // Center crop
      const startX = (sourceImage.naturalWidth - targetW) / 2;
      const startY = (sourceImage.naturalHeight - targetH) / 2;

      ctx.drawImage(sourceImage, startX, startY, targetW, targetH, 0, 0, targetW, targetH);

      const mime = sourceFile?.type || 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Crop failed');
          setProcessedSize(blob.size);
          setProcessedUrl(URL.createObjectURL(blob));
          setNotification({
            type: 'success',
            text: isUrdu ? 'تصویر کاٹی گئی (کراپ کامیاب)۔' : `Cropped to ${targetW}x${targetH}px successfully.`,
          });
          setIsProcessing(false);
        },
        mime,
        0.95
      );
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
      setIsProcessing(false);
    }
  };

  // 4. EXECUTE CONVERT FORMAT
  const executeConvert = () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = sourceImage.naturalWidth;
      canvas.height = sourceImage.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      // If converting to JPEG, draw white background first in case source PNG had transparency
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(sourceImage, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Format conversion failed');
          setProcessedSize(blob.size);
          setProcessedUrl(URL.createObjectURL(blob));
          const ext = targetFormat.split('/')[1].toUpperCase();
          setNotification({
            type: 'success',
            text: isUrdu ? `تصویر کو ${ext} فارمیٹ میں تبدیل کر دیا گیا۔` : `Image successfully converted to ${ext} format.`,
          });
          setIsProcessing(false);
        },
        targetFormat,
        0.92
      );
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
      setIsProcessing(false);
    }
  };

  // 5. EXECUTE ROTATE & FLIP
  const executeRotate = () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const rads = (rotationDegrees * Math.PI) / 180;
      const is90or270 = Math.abs(rotationDegrees) % 180 === 90;

      const cw = is90or270 ? sourceImage.naturalHeight : sourceImage.naturalWidth;
      const ch = is90or270 ? sourceImage.naturalWidth : sourceImage.naturalHeight;

      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      ctx.save();
      // Translate to center
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate(rads);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(sourceImage, -sourceImage.naturalWidth / 2, -sourceImage.naturalHeight / 2);
      ctx.restore();

      const mime = sourceFile?.type || 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Rotation failed');
          setProcessedSize(blob.size);
          setProcessedUrl(URL.createObjectURL(blob));
          setNotification({
            type: 'success',
            text: isUrdu ? 'تصویر کو کامیابی سے گھما اور پلٹ دیا گیا۔' : `Image rotated ${rotationDegrees}° & transformed.`,
          });
          setIsProcessing(false);
        },
        mime,
        0.95
      );
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* File Upload Box */}
      <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 rounded-2xl p-6 text-center relative bg-stone-50/50 dark:bg-stone-900/50 transition">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
        <p className="font-semibold text-stone-800 dark:text-stone-200">
          {sourceFile ? sourceFile.name : (isUrdu ? 'تصویر منتخب کریں یا یہاں ڈریگ کریں' : 'Click or drag & drop an image to get started')}
        </p>
        <p className="text-xs text-stone-500 mt-1">
          {isUrdu ? 'سپورٹڈ: جے پی جی، پی این جی، ویب پی (براؤزر میں نجی پروسیسنگ)' : 'Supports JPG, PNG, WebP (Processed 100% locally on your device)'}
        </p>
      </div>

      {sourceImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls Panel */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-5">
            {/* TOOL 1: RESIZE */}
            {toolId === 'image-resize' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Maximize className="w-5 h-5" />
                  <span>{isUrdu ? 'سائز کی تبدیلیاں' : 'Resize Dimensions'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      {isUrdu ? 'چوڑائی (Width px)' : 'Width (px)'}
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={resizeWidth}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 dark:border-stone-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      {isUrdu ? 'لمبائی (Height px)' : 'Height (px)'}
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={resizeHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 dark:border-stone-700 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-emerald-600 cursor-pointer"
                  >
                    {lockAspectRatio ? <Lock className="w-3.5 h-3.5 text-emerald-600" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{isUrdu ? 'تناسب مقفل رکھیں' : 'Lock Aspect Ratio'}</span>
                  </button>

                  <div className="flex gap-1.5">
                    {[0.25, 0.5, 0.75, 1.5, 2.0].map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => applyPresetScale(scale)}
                        className="px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md text-[11px] font-mono cursor-pointer"
                      >
                        {scale * 100}%
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={isProcessing}
                  onClick={executeResize}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Maximize className="w-4 h-4" />
                  {isUrdu ? 'سائز تبدیل کریں' : 'Apply Resize'}
                </button>
              </div>
            )}

            {/* TOOL 2: COMPRESS */}
            {toolId === 'image-compress' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Zap className="w-5 h-5" />
                  <span>{isUrdu ? 'کمپریشن کوالٹی' : 'Compression Control'}</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>{isUrdu ? 'کوالٹی لیول:' : 'Image Quality:'}</span>
                    <span className="text-emerald-600 font-mono text-sm">{compressionQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={95}
                    value={compressionQuality}
                    onChange={(e) => setCompressionQuality(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                    <span>{isUrdu ? 'چھوٹا سائز (کم کوالٹی)' : 'Smallest Size'}</span>
                    <span>{isUrdu ? 'معیاری (بہترین)' : 'Balanced'}</span>
                    <span>{isUrdu ? 'زیادہ کوالٹی' : 'High Quality'}</span>
                  </div>
                </div>

                <button
                  disabled={isProcessing}
                  onClick={executeCompress}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  {isUrdu ? 'کمپریس کریں' : 'Compress Image Now'}
                </button>
              </div>
            )}

            {/* TOOL 3: CROP */}
            {toolId === 'image-crop' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Crop className="w-5 h-5" />
                  <span>{isUrdu ? 'کراپ کی ریشو منتخب کریں' : 'Select Crop Ratio'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'free', label: isUrdu ? 'مکمل' : 'Original' },
                    { id: '1:1', label: '1:1 Square' },
                    { id: '4:3', label: '4:3 Standard' },
                    { id: '16:9', label: '16:9 Widescreen' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setCropAspect(preset.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        cropAspect === preset.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <button
                  disabled={isProcessing}
                  onClick={executeCrop}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Crop className="w-4 h-4" />
                  {isUrdu ? 'کراپ کا اطلاق کریں' : 'Apply Crop'}
                </button>
              </div>
            )}

            {/* TOOL 4: CONVERT */}
            {toolId === 'image-convert' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <RefreshCw className="w-5 h-5" />
                  <span>{isUrdu ? 'مطلوبہ فارمیٹ' : 'Target Format'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/webp', label: 'WebP (Modern)' },
                    { id: 'image/jpeg', label: 'JPG / JPEG' },
                    { id: 'image/png', label: 'PNG (Lossless)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setTargetFormat(fmt.id as any)}
                      className={`py-3 px-2 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        targetFormat === fmt.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                <button
                  disabled={isProcessing}
                  onClick={executeConvert}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  {isUrdu ? 'فارمیٹ تبدیل کریں' : 'Convert Format'}
                </button>
              </div>
            )}

            {/* TOOL 5: ROTATE & FLIP */}
            {toolId === 'image-rotate' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Compass className="w-5 h-5" />
                  <span>{isUrdu ? 'گھمانے اور پلٹنے کے آپشنز' : 'Rotation & Orientation'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRotationDegrees((prev) => (prev + 90) % 360)}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-2 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 text-emerald-600" />
                    <span>+90° Clockwise</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotationDegrees((prev) => (prev - 90 + 360) % 360)}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-2 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 text-emerald-600 -scale-x-100" />
                    <span>-90° Counter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipH(!flipH)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer ${
                      flipH ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 font-bold' : 'border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    <span>Flip Horizontal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipV(!flipV)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer ${
                      flipV ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 font-bold' : 'border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <FlipVertical className="w-4 h-4" />
                    <span>Flip Vertical</span>
                  </button>
                </div>

                <button
                  disabled={isProcessing}
                  onClick={executeRotate}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  {isUrdu ? 'لاگو کریں' : 'Apply Transformation'}
                </button>
              </div>
            )}

            {/* Notification alert */}
            {notification && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                  notification.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200'
                }`}
              >
                {notification.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                )}
                <span>{notification.text}</span>
              </div>
            )}
          </div>

          {/* Preview & Download Panel */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {processedUrl ? (isUrdu ? 'پروسیس شدہ تصویر کا پیش نظارہ' : 'Processed Result Preview') : (isUrdu ? 'اصل تصویر کا پیش نظارہ' : 'Original Preview')}
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  {originalDimensions.width}x{originalDimensions.height}px ({formatFileSize(originalSize)})
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 aspect-video flex items-center justify-center">
                <img
                  src={processedUrl || imagePreviewUrl || ''}
                  alt="preview"
                  className="max-h-full max-w-full object-contain"
                  style={{
                    transform: !processedUrl && toolId === 'image-rotate'
                      ? `rotate(${rotationDegrees}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
                      : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>
            </div>

            {/* Stats & Download bar */}
            {processedUrl ? (
              <div className="pt-2 space-y-3">
                <div className="flex justify-between items-center text-xs p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                  <div>
                    <span className="text-stone-400">{isUrdu ? 'نیا سائز:' : 'Processed Size: '}</span>
                    <span className="font-semibold text-emerald-600 font-mono">{formatFileSize(processedSize)}</span>
                  </div>
                  {originalSize > processedSize && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full font-bold text-[10px]">
                      {Math.round(((originalSize - processedSize) / originalSize) * 100)}% smaller
                    </span>
                  )}
                </div>

                <a
                  href={processedUrl}
                  download={`alihaider_image_${toolId}_${Date.now()}.${targetFormat === 'image/webp' ? 'webp' : targetFormat === 'image/png' ? 'png' : 'jpg'}`}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {isUrdu ? 'تیار شدہ تصویر ڈاؤنلوڈ کریں' : 'Download Processed Image'}
                </a>
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-2">
                {isUrdu ? 'نتیجہ دیکھنے اور ڈاؤنلوڈ کرنے کے لیے بائیں جانب کا بٹن دبائیں۔' : 'Adjust settings on the left and click the action button to process.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
