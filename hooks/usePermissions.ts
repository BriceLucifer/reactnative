/**
 * @fileoverview Hooks for handling device permissions
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { ERROR_MESSAGES } from '@/config';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface UsePermissionReturn {
  status: PermissionStatus;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<PermissionStatus>;
}

/**
 * Hook for managing media library permissions
 */
export function useMediaLibraryPermission(): UsePermissionReturn {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');

  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const result = await ImagePicker.getMediaLibraryPermissionsAsync();
      const newStatus = result.granted ? 'granted' : 'denied';
      setStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('Failed to check media library permission:', error);
      setStatus('denied');
      return 'denied';
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const granted = result.granted;
      setStatus(granted ? 'granted' : 'denied');

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Photo library access is required to add images to your notes.',
          [{ text: 'OK' }]
        );
      }

      return granted;
    } catch (error) {
      console.error('Failed to request media library permission:', error);
      Alert.alert('Error', ERROR_MESSAGES.PERMISSION_DENIED);
      setStatus('denied');
      return false;
    }
  }, []);

  return { status, requestPermission, checkPermission };
}

/**
 * Hook for managing microphone permissions
 */
export function useMicrophonePermission(): UsePermissionReturn {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');

  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const result = await Audio.getPermissionsAsync();
      const newStatus = result.granted ? 'granted' : 'denied';
      setStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('Failed to check microphone permission:', error);
      setStatus('denied');
      return 'denied';
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await Audio.requestPermissionsAsync();
      const granted = result.granted;
      setStatus(granted ? 'granted' : 'denied');

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone access is required to record audio notes.',
          [{ text: 'OK' }]
        );
      }

      return granted;
    } catch (error) {
      console.error('Failed to request microphone permission:', error);
      Alert.alert('Error', ERROR_MESSAGES.PERMISSION_DENIED);
      setStatus('denied');
      return false;
    }
  }, []);

  return { status, requestPermission, checkPermission };
}

/**
 * Hook for managing camera permissions
 */
export function useCameraPermission(): UsePermissionReturn {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');

  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const result = await ImagePicker.getCameraPermissionsAsync();
      const newStatus = result.granted ? 'granted' : 'denied';
      setStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('Failed to check camera permission:', error);
      setStatus('denied');
      return 'denied';
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await ImagePicker.requestCameraPermissionsAsync();
      const granted = result.granted;
      setStatus(granted ? 'granted' : 'denied');

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Camera access is required to take photos for your notes.',
          [{ text: 'OK' }]
        );
      }

      return granted;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      Alert.alert('Error', ERROR_MESSAGES.PERMISSION_DENIED);
      setStatus('denied');
      return false;
    }
  }, []);

  return { status, requestPermission, checkPermission };
}