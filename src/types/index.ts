export type ToolCategory = 'pdf' | 'image' | 'study' | 'writing' | 'calculator' | 'guides';

export interface ToolDefinition {
  id: string;
  name: string;
  nameUrdu?: string;
  description: string;
  descriptionUrdu?: string;
  category: ToolCategory;
  icon: string;
  badge?: string;
  isClientSideOnly: boolean;
  requiresExternalApi?: boolean;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  role: string;
  date: string;
  approved: boolean;
  isDemo?: boolean;
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  hasInteracted: boolean;
}

export type Language = 'en' | 'ur';
