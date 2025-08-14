/**
 * @fileoverview Application configuration and constants
 * 
 * Centralizes all configuration values and environment-specific settings
 */

import { AppConfig, Environment } from '@/types';

// ===== ENVIRONMENT CONFIGURATION =====

/**
 * Environment variables with proper typing
 */
const env: Environment = {
  EXPO_PUBLIC_APPWRITE_ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  EXPO_PUBLIC_APPWRITE_PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  EXPO_PUBLIC_APPWRITE_PROJECT_NAME: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME,
};

/**
 * Main application configuration
 */
export const APP_CONFIG: AppConfig = {
  baseURL: env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://api.freedomai.fun/v1',
  projectId: env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '689c404400138a4a5f2d',
  environment: __DEV__ ? 'development' : 'production',
};

// ===== API ENDPOINTS =====

/**
 * API endpoint configurations
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  NOTES: {
    LIST: '/notes',
    CREATE: '/notes',
    UPDATE: (id: string) => `/notes/${id}`,
    DELETE: (id: string) => `/notes/${id}`,
    GET: (id: string) => `/notes/${id}`,
  },
  STORAGE: {
    UPLOAD: '/storage/upload',
    DELETE: (fileId: string) => `/storage/${fileId}`,
    VIEW: (bucketId: string, fileId: string) => 
      `/storage/buckets/${bucketId}/files/${fileId}/view?project=${APP_CONFIG.projectId}&mode=admin`,
  },
} as const;

// ===== OAUTH CONFIGURATION =====

/**
 * OAuth redirect URLs
 */
export const OAUTH_CONFIG = {
  SUCCESS_REDIRECT: `${APP_CONFIG.baseURL.replace('/v1', '')}/console`,
  FAILURE_REDIRECT: `${APP_CONFIG.baseURL.replace('/v1', '')}/console`,
  CUSTOM_SCHEME: 'shiro://auth-callback',
} as const;

// ===== DEMO DATA CONFIGURATION =====

/**
 * Demo audio URL for development
 */
export const DEMO_AUDIO_URL = `${APP_CONFIG.baseURL}/storage/buckets/689b2283000a1eb4930c/files/689b2294000e0c2dfbbc/view?project=${APP_CONFIG.projectId}&mode=admin`;

// ===== UI CONFIGURATION =====

/**
 * Layout and spacing constants
 */
export const LAYOUT = {
  HEADER_HEIGHT: 64,
  TOOLBAR_HEIGHT: 60,
  DRAWER_WIDTH_PERCENTAGE: 0.8,
  CARD_BORDER_RADIUS: 32,
  BUTTON_BORDER_RADIUS: 12,
} as const;

/**
 * Animation configuration
 */
export const ANIMATIONS = {
  SPRING_CONFIG: {
    damping: 14,
    stiffness: 160,
  },
  TIMING_CONFIG: {
    duration: 300,
  },
  GESTURE_CONFIG: {
    threshold: 0.28,
    velocity: 600,
  },
} as const;

/**
 * Performance optimization settings
 */
export const PERFORMANCE = {
  LIST_INITIAL_NUM_TO_RENDER: 10,
  LIST_MAX_TO_RENDER_PER_BATCH: 10,
  LIST_WINDOW_SIZE: 10,
  DEBOUNCE_DELAY: 300,
} as const;

// ===== VALIDATION RULES =====

/**
 * Form validation constants
 */
export const VALIDATION = {
  MIN_NOTE_LENGTH: 1,
  MAX_NOTE_LENGTH: 10000,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_AUDIO_DURATION: 600, // 10 minutes in seconds
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'm4a', 'aac'],
} as const;

// ===== ERROR MESSAGES =====

/**
 * Standardized error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  PERMISSION_DENIED: 'Permission denied. Please grant the required permissions.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FORMAT: 'Invalid file format. Please select a supported format.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  LOAD_FAILED: 'Failed to load data. Please refresh and try again.',
  AUTH_FAILED: 'Authentication failed. Please try logging in again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// ===== SUCCESS MESSAGES =====

/**
 * Standardized success messages
 */
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Item deleted successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  UPLOAD_SUCCESS: 'File uploaded successfully!',
} as const;