/**
 * @fileoverview Common type definitions for the Shiro application
 * 
 * This file centralizes all shared types to avoid duplication and ensure consistency
 * across components and services.
 */

import { ImageSourcePropType } from 'react-native';

// ===== CONTENT TYPES =====

/**
 * Represents different types of content blocks that can be part of a note
 */
export type ContentBlock =
  | { type: 'text'; value: string }
  | { type: 'image'; url: string | ImageSourcePropType }
  | { 
      type: 'audio'; 
      url: string; 
      duration: string; 
      transcript?: string; 
      uploading?: boolean; 
    };

/**
 * Extended content block used in the editor with additional states
 */
export type EditorContentBlock = 
  | ContentBlock 
  | { type: 'prompt'; value: string } 
  | { type: 'text'; value: string; isAIGenerating?: boolean; isAI?: boolean };

// ===== NOTE TYPES =====

/**
 * Core note interface
 */
export interface Note {
  id: string;
  updatedAt: string;
  content: ContentBlock[];
}

/**
 * Partial note for creation operations
 */
export interface CreateNoteInput {
  content?: ContentBlock[];
}

/**
 * Partial note for update operations
 */
export interface UpdateNoteInput {
  content?: ContentBlock[];
  updatedAt?: string;
}

// ===== UI COMPONENT TYPES =====

/**
 * Common props for modal components
 */
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Props for components that handle note interactions
 */
export interface NoteActionProps {
  onPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

/**
 * Audio-related props
 */
export interface AudioProps {
  url: string;
  duration: string;
  transcript?: string;
  uploading?: boolean;
  onChangeTranscript?: (transcript: string) => void;
  onDelete?: () => void;
}

/**
 * Recording modal callback props
 */
export interface RecordingCallbacks {
  onRecorded: (uri: string, durationMs: number, transcript?: string) => void;
}

// ===== CHAT TYPES =====

/**
 * Chat message structure
 */
export interface ChatMessage {
  text: string;
  type: 'user' | 'ai';
  timestamp: number;
}

// ===== API RESPONSE TYPES =====

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean;
  user?: {
    $id: string;
    email: string;
    name?: string;
  };
  error?: string;
}

// ===== CONFIGURATION TYPES =====

/**
 * Application configuration
 */
export interface AppConfig {
  baseURL: string;
  projectId: string;
  environment: 'development' | 'production';
  DEMO_AUDIO_URL?: string;
}

/**
 * Environment variables interface
 */
export interface Environment {
  EXPO_PUBLIC_APPWRITE_ENDPOINT?: string;
  EXPO_PUBLIC_APPWRITE_PROJECT_ID?: string;
  EXPO_PUBLIC_APPWRITE_PROJECT_NAME?: string;
}

// ===== ERROR TYPES =====

/**
 * Application error interface
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Form validation errors
 */
export interface ValidationErrors {
  [field: string]: string[];
}

// ===== UTILITY TYPES =====

/**
 * Generic callback function type
 */
export type Callback<T = void> = (value: T) => void;

/**
 * Async callback function type
 */
export type AsyncCallback<T = void> = (value: T) => Promise<void>;

/**
 * Component ref type for common UI elements
 */
export interface ComponentRef {
  focus?: () => void;
  blur?: () => void;
  reset?: () => void;
}

// ===== CONSTANTS =====

/**
 * Predefined animation durations
 */
export const ANIMATION_DURATION = {
  FAST: 200,
  MEDIUM: 300,
  SLOW: 500,
} as const;

/**
 * Common spacing values
 */
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
} as const;

/**
 * Common color palette
 */
export const COLORS = {
  PRIMARY: '#020F20',
  SECONDARY: '#8E8E93',
  SUCCESS: '#34C759',
  ERROR: '#FF3B30',
  WARNING: '#FF9500',
  BACKGROUND: '#F8F9FA',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;

/**
 * Animation configurations
 */
export const ANIMATIONS = {
  MODAL_ANIMATION_TYPE: 'slide' as const,
  SPRING_CONFIG: {
    damping: 16,
    stiffness: 180,
  },
  TIMING_CONFIG: {
    duration: 260,
  },
  GESTURE_CONFIG: {
    threshold: 0.3,
    velocity: 800,
  },
} as const;

/**
 * Layout constants
 */
export const LAYOUT = {
  MODAL_HEIGHT_PERCENTAGE: 0.80,
  MODAL_BORDER_RADIUS: 24,
  INPUT_BORDER_RADIUS: 14,
  BUTTON_BORDER_RADIUS: 12,
  DRAWER_WIDTH_PERCENTAGE: 0.85,
} as const;