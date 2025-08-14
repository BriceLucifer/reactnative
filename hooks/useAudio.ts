/**
 * @fileoverview Hooks for audio functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { Audio, AVPlaybackStatusSuccess, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { ERROR_MESSAGES } from '@/config';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  error: string | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setPosition: (position: number) => Promise<void>;
  cleanup: () => Promise<void>;
}

/**
 * Hook for managing audio playback
 */
export function useAudioPlayer(url: string): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  const initializeAudio = useCallback(async (): Promise<Audio.Sound> => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync() as AVPlaybackStatusSuccess;
        if (status.isLoaded) return soundRef.current;
        await soundRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false, progressUpdateIntervalMillis: 200 },
        (status) => {
          const s = status as AVPlaybackStatusSuccess;
          if (s.isLoaded) {
            setIsPlaying(s.isPlaying);
            setPosition(s.positionMillis || 0);
            if (s.durationMillis) setDuration(s.durationMillis);
            if (s.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        }
      );

      soundRef.current = sound;
      return sound;
    } catch (err) {
      console.error('Audio initialization error:', err);
      setError(ERROR_MESSAGES.GENERIC_ERROR);
      throw err;
    }
  }, [url]);

  const play = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sound = await initializeAudio();
      const status = await sound.getStatusAsync() as AVPlaybackStatusSuccess;
      
      if (!status.isLoaded) return;

      if (status.positionMillis === status.durationMillis) {
        await sound.setPositionAsync(0);
      }
      
      await sound.playAsync();
    } catch (err) {
      console.error('Audio play error:', err);
      setError('Unable to play audio. Please try again.');
      Alert.alert('Playback Error', 'Unable to play audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [initializeAudio]);

  const pause = useCallback(async (): Promise<void> => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
    } catch (err) {
      console.error('Audio pause error:', err);
    }
  }, []);

  const stop = useCallback(async (): Promise<void> => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      }
    } catch (err) {
      console.error('Audio stop error:', err);
    }
  }, []);

  const setPosition = useCallback(async (newPosition: number): Promise<void> => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(newPosition);
      }
    } catch (err) {
      console.error('Audio position error:', err);
    }
  }, []);

  const cleanup = useCallback(async (): Promise<void> => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (err) {
      console.error('Audio cleanup error:', err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isPlaying,
    isLoading,
    duration,
    position,
    error,
    play,
    pause,
    stop,
    setPosition,
    cleanup,
  };
}