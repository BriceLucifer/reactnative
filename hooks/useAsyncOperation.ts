/**
 * @fileoverview Hook for handling async operations with loading states
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { ERROR_MESSAGES } from '@/config';

interface UseAsyncOperationOptions {
  showSuccessAlert?: boolean;
  showErrorAlert?: boolean;
  successMessage?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

interface UseAsyncOperationReturn<T> {
  execute: (...args: any[]) => Promise<T>;
  isLoading: boolean;
  error: string | null;
  data: T | null;
  reset: () => void;
}

/**
 * Hook for managing async operations with consistent error handling and loading states
 */
export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const {
    showSuccessAlert = false,
    showErrorAlert = true,
    successMessage,
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await operation(...args);
      
      setData(result);
      
      if (showSuccessAlert && successMessage) {
        Alert.alert('Success', successMessage);
      }
      
      onSuccess?.(result);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC_ERROR;
      setError(errorMessage);
      
      if (showErrorAlert) {
        Alert.alert('Error', errorMessage);
      }
      
      onError?.(err);
      throw err;
      
    } finally {
      setIsLoading(false);
    }
  }, [operation, showSuccessAlert, showErrorAlert, successMessage, onSuccess, onError]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  };
}