import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    Image, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Modal, Animated, ActivityIndicator,
    StatusBar
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Audio, AVPlaybackStatusSuccess, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Types ---
export type ContentBlock =
    | { type: 'text'; value: string }
    | { type: 'image'; url: string }
    | { type: 'audio'; url: string; duration: string; transcript?: string; uploading?: boolean };
export interface Note { id: string; updatedAt: string; content: ContentBlock[]; }
type EditorContentBlock = ContentBlock | { type: 'prompt'; value: string } | { type: 'text'; value: string; isAIGenerating?: boolean; isAI?: boolean };

interface AudioCardProps {
    url: string;
    duration: string;
    transcript?: string;
    uploading?: boolean;
    onChangeTranscript?: (t: string) => void;
    onDelete?: () => void;
}

interface RecordingModalProps {
    visible: boolean;
    onClose: () => void;
    onRecorded: (uri: string, durationMs: number, transcript?: string) => void;
}

// const { width: SCREEN_WIDTH } = Dimensions.get('window'); // Unused for now

// Environment configuration
const API_CONFIG = {
    baseURL: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://api.freedomai.fun/v1',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '689c404400138a4a5f2d',
};

// Default audio URL for demo
const DEFAULT_AUDIO_URL = `${API_CONFIG.baseURL}/storage/buckets/689b2283000a1eb4930c/files/689b2294000e0c2dfbbc/view?project=${API_CONFIG.projectId}&mode=admin`;

// --- Mock Database (for demo purposes only) ---
const FAKE_NOTES_DATABASE: Note[] = [
    {
        id: '1',
        updatedAt: '2025/08/11 10:24',
        content: [
            { type: 'text', value: 'If you want to make a product that can go global, it is not enough to just translate the language.' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' },
        ],
    },
    {
        id: '3',
        updatedAt: '2025/06/16 12:24',
        content: [
            { type: 'text', value: 'It is not enough to just translate the language.' },
            { type: 'audio', url: DEFAULT_AUDIO_URL, duration: '00:12', transcript: 'I drank a large glass of hot water today, which warmed my stomach and heart. I used to think that drinking hot water was perfunctory advice, but now I think it is basic care for myself.' },
        ],
    },
    {
        id: '5',
        updatedAt: '2025/08/11 10:24',
        content: [
            { type: 'text', value: 'This note has multiple images and audio.' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/04/24/01/29/trees-9554109_1280.jpg' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' },
            { type: 'audio', url: DEFAULT_AUDIO_URL, duration: '00:12', transcript: 'This is a longer audio transcription that will demonstrate the show more functionality. I am still learning not to push myself too hard, even if it just starts with giving myself a glass of water. Self-care is not perfunctory advice but genuine care for oneself.' },
        ],
    },
];

// --- Utils ---
const mmss = (ms: number) => {
    const s = Math.max(0, Math.round(ms / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
};

// --- Audio preview card ---
const AudioCard = React.memo<AudioCardProps>(function AudioCard({
    url, duration, transcript, uploading, onChangeTranscript, onDelete,
}) {
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lenMs, setLenMs] = useState(0);
    const [posMs, setPosMs] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => () => { if (soundRef.current) soundRef.current.unloadAsync(); }, []);

    const ensureSound = useCallback(async () => {
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
                (st) => {
                    const s = st as AVPlaybackStatusSuccess;
                    if (s.isLoaded) {
                        setIsPlaying(s.isPlaying);
                        setPosMs(s.positionMillis || 0);
                        if (s.durationMillis) setLenMs(s.durationMillis);
                        if (s.didJustFinish) {
                            setIsPlaying(false);
                            setPosMs(0);
                        }
                    }
                }
            );
            soundRef.current = sound;
            return sound;
        } catch (error) {
            console.error('Audio setup error:', error);
            throw error;
        }
    }, [url]);

    const togglePlay = useCallback(async () => {
        if (uploading) return;
        try {
            const sound = await ensureSound();
            const st = await sound.getStatusAsync() as AVPlaybackStatusSuccess;
            if (!st.isLoaded) return;
            
            if (st.isPlaying) {
                await sound.pauseAsync();
            } else {
                if (st.positionMillis === st.durationMillis) {
                    await sound.setPositionAsync(0);
                }
                await sound.playAsync();
            }
        } catch (error) {
            console.error('Audio playback error:', error);
            setIsPlaying(false);
            Alert.alert('Playback Error', 'Unable to play audio. Please try again.');
        }
    }, [uploading, ensureSound]);

    const progressPct = lenMs ? Math.min(1, posMs / lenMs) : 0;

    const truncatedTranscript = transcript && transcript.length > 50 
        ? transcript.substring(0, 50) + '...' 
        : transcript;

    return (
        <View style={styles.audioContainer}>
            <View style={styles.audioTopRow}>
                <TouchableOpacity onPress={togglePlay} disabled={!!uploading} style={[styles.audioPlayBtn, isPlaying && styles.audioPlayBtnActive]}>
                    <Text style={styles.audioPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
                <View style={styles.audioInfo}>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
                            <View style={[styles.progressThumb, { left: `${progressPct * 100}%` }]} />
                        </View>
                    </View>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{mmss(posMs)}</Text>
                        <Text style={styles.audioDurationText}>{duration}</Text>
                    </View>
                </View>
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} style={styles.blockDeleteBtn}>
                        <Text style={styles.blockDeleteX}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 折叠展开的转录文本 */}
            <View style={styles.transcriptContainer}>
                <Text style={styles.audioTranscriptText}>
                    {isExpanded ? transcript : truncatedTranscript}
                </Text>
                
                {transcript && transcript.length > 50 && (
                    <TouchableOpacity 
                        onPress={() => setIsExpanded(!isExpanded)}
                        style={styles.showMoreButton}
                    >
                        <Text style={styles.showMoreText}>
                            {isExpanded ? 'show less' : 'show more'}
                        </Text>
                    </TouchableOpacity>
                )}
                
                {/* 可编辑的转录文本 */}
                {isExpanded && (
                    <TextInput
                        style={styles.audioTranscriptInput}
                        placeholder="Edit transcription..."
                        placeholderTextColor="#8E8E93"
                        multiline
                        value={transcript ?? ''}
                        onChangeText={onChangeTranscript}
                        editable={!uploading}
                    />
                )}
            </View>

            {uploading && (
                <View style={styles.uploadingMask}>
                    <ActivityIndicator color="#000" size="small" />
                    <Text style={styles.uploadingText}>Uploading…</Text>
                </View>
            )}
        </View>
    );
});

// --- Recording Modal ---
const RecordingModal = React.memo<RecordingModalProps>(function RecordingModal({
    visible, onClose, onRecorded,
}) {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [durMs, setDurMs] = useState(0);
    const [hasMetering, setHasMetering] = useState<boolean | null>(null);

    const statusTimer = useRef<NodeJS.Timeout | null>(null);
    const meterTimer = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(false);

    const coreScale = useRef(new Animated.Value(1)).current;
    const ripples = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
    const breathingAnim = useRef<Animated.CompositeAnimation | null>(null);

    const animateRipple = (v: Animated.Value, firstDelay = 0) => {
        v.setValue(0);
        const go = () => {
            if (!mountedRef.current) return;
            Animated.timing(v, { toValue: 1, duration: 1400, useNativeDriver: true })
                .start(({ finished }) => { if (finished && mountedRef.current) animateRipple(v, 0); });
        };
        if (firstDelay) setTimeout(go, firstDelay); else go();
    };
    const startBreathing = () => {
        breathingAnim.current = Animated.loop(
            Animated.sequence([
                Animated.timing(coreScale, { toValue: 1.25, duration: 600, useNativeDriver: true }),
                Animated.timing(coreScale, { toValue: 1.00, duration: 700, useNativeDriver: true }),
            ])
        );
        breathingAnim.current.start();
    };
    const stopBreathing = useCallback(() => { 
        if (breathingAnim.current) breathingAnim.current.stop(); 
        coreScale.setValue(1); 
    }, [coreScale]);

    useEffect(() => {
        mountedRef.current = visible;
        if (!visible) return;

        (async () => {
            try {
                const perm = await Audio.requestPermissionsAsync();
                if (perm.status !== 'granted') { 
                    Alert.alert('Permission Required', 'Microphone access is required to record audio.'); 
                    onClose(); 
                    return; 
                }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                shouldDuckAndroid: true,
                staysActiveInBackground: false,
            });

                const { recording } = await Audio.Recording.createAsync({
                    ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
                    // @ts-ignore
                    android: { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android, isMeteringEnabled: true },
                    // @ts-ignore
                    ios: { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios, meteringEnabled: true },
                });
            setRecording(recording);

            statusTimer.current = setInterval(async () => {
                try {
                    const st = await recording.getStatusAsync();
                    if ('durationMillis' in st && typeof (st as any).durationMillis === 'number') setDurMs((st as any).durationMillis);
                } catch {}
            }, 200);

            let seen = 0;
            meterTimer.current = setInterval(async () => {
                try {
                    const st = await recording.getStatusAsync();
                    if ('metering' in st && typeof (st as any).metering === 'number') {
                        seen++; if (hasMetering !== true) setHasMetering(true);
                        const db = Math.max(-160, (st as any).metering);
                        const norm = (db + 160) / 160;        // 0~1
                        const scale = 1 + norm * 0.5;         // 1~1.5
                        Animated.spring(coreScale, { toValue: scale, useNativeDriver: true, speed: 12, bounciness: 6 }).start();
                    } else if (seen === 2 && hasMetering !== false) { setHasMetering(false); startBreathing(); }
                } catch {}
            }, 140);

                animateRipple(ripples[0], 0);
                animateRipple(ripples[1], 300);
                animateRipple(ripples[2], 600);
            } catch (error) {
                console.error('Recording initialization error:', error);
                Alert.alert('Recording Error', 'Failed to initialize recording. Please try again.');
                onClose();
            }
        })();

        return () => {
            mountedRef.current = false;
            if (statusTimer.current) clearInterval(statusTimer.current);
            if (meterTimer.current) clearInterval(meterTimer.current);
            stopBreathing();
        };
    }, [visible]);

    const stopAndSave = useCallback(async () => {
        try {
            if (statusTimer.current) clearInterval(statusTimer.current);
            if (meterTimer.current) clearInterval(meterTimer.current);
            stopBreathing();
            if (!recording) return;

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI() ?? '';
            const st = await recording.getStatusAsync();
            const ms = (st as any).durationMillis ?? 0;
            
            if (uri && ms > 0) {
                onRecorded(uri, ms, '');
            }
            onClose();
        } catch (error) {
            console.error('Recording save error:', error);
            Alert.alert('Save Error', 'Failed to save recording. Please try again.');
        }
    }, [recording, onRecorded, onClose, stopBreathing]);

    const cancel = useCallback(async () => {
        try {
            if (statusTimer.current) clearInterval(statusTimer.current);
            if (meterTimer.current) clearInterval(meterTimer.current);
            stopBreathing();
            if (recording) await recording.stopAndUnloadAsync().catch(() => {});
            onClose();
        } catch (error) {
            console.error('Recording cancel error:', error);
            onClose();
        }
    }, [recording, onClose, stopBreathing]);

    const Ripple = ({ v }: { v: Animated.Value }) => {
        const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
        const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0] });
        return (
            <Animated.View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    width: 160, height: 160, borderRadius: 80,
                    backgroundColor: '#000',
                    transform: [{ scale }],
                    opacity,
                }}
            />
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalMask}>
                <View style={styles.modalSheet}>
                    <Text style={styles.modalTitle}>Recording… {mmss(durMs)}</Text>

                    <View style={{ alignItems: 'center', marginTop: 24 }}>
                        <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
                            <Ripple v={ripples[0]} />
                            <Ripple v={ripples[1]} />
                            <Ripple v={ripples[2]} />
                            <Animated.View
                                style={{
                                    width: 120, height: 120, borderRadius: 60, backgroundColor: '#000',
                                    alignItems: 'center', justifyContent: 'center', transform: [{ scale: coreScale }],
                                    shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6,
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 30 }}>● REC</Text>
                            </Animated.View>
                        </View>
                        {hasMetering === false && (
                            <Text style={{ marginTop: 10, color: '#6B6B6B', fontSize: 12 }}>
                                Device does not report metering. Using smooth breathing.
                            </Text>
                        )}
                    </View>

                    <View style={styles.modalRow}>
                        <TouchableOpacity onPress={cancel} style={[styles.modalBtn, styles.modalCancel]}>
                            <Text style={styles.modalBtnTextDark}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={stopAndSave} style={[styles.modalBtn, styles.modalStopDark]}>
                            <Text style={styles.modalBtnText}>Stop & Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
});

export default function NoteEditorScreen() {
    const { noteId } = useLocalSearchParams<{ noteId?: string }>();
    const [content, setContent] = useState<EditorContentBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showRecorder, setShowRecorder] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const loadNote = async () => {
            try {
                setIsLoading(true);
                if (noteId) {
                    // TODO: Replace with actual API call
                    const existingNote = FAKE_NOTES_DATABASE.find(n => n.id === noteId);
                    if (existingNote) {
                        setContent(existingNote.content);
                    } else {
                        Alert.alert('Error', 'Note not found');
                        router.back();
                    }
                } else {
                    const now = new Date();
                    const greeting = `Good ${now.getHours() < 12 ? 'morning' : 'afternoon'}, Mike.`;
                    setContent([{ type: 'prompt', value: `${greeting}\nWhat's on your mind?` }, { type: 'text', value: '' }]);
                }
            } catch (error) {
                console.error('Failed to load note:', error);
                Alert.alert('Error', 'Failed to load note');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadNote();
    }, [noteId]);

    const handleTextChange = useCallback((newText: string, blockIndex: number) => {
        setContent(prev => {
            const copy = [...prev];
            const b = copy[blockIndex];
            if (b && b.type === 'text') {
                (b as any).value = newText;
                setHasUnsavedChanges(true);
            }
            return copy;
        });
    }, []);

    const handleAddImage = useCallback(async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (perm.status !== 'granted') {
                Alert.alert('Permission Required', 'Photo library access is required to add images.');
                return;
            }
            
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.92,
                selectionLimit: 1,
                allowsEditing: true,
                aspect: [16, 9],
            });
            
            if (res.canceled) return;
            const uri = res.assets?.[0]?.uri;
            if (!uri) return;
            
            setContent(prev => [...prev, { type: 'image', url: uri }]);
            setHasUnsavedChanges(true);
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to add image. Please try again.');
        }
    }, []);

    const handleDelete = useCallback((idx: number) => {
        setContent(prev => prev.filter((_, i) => i !== idx));
        setHasUnsavedChanges(true);
    }, []);
    
    const handleAddText = useCallback(() => {
        setContent(prev => [...prev, { type: 'text', value: '' }]);
        setHasUnsavedChanges(true);
    }, []);

    const handleRecorded = useCallback((localUri: string, durationMs: number, transcript?: string) => {
        const blk: ContentBlock = { type: 'audio', url: localUri, duration: mmss(durationMs), transcript: transcript ?? '' };
        setContent(prev => [...prev, blk]);
        setHasUnsavedChanges(true);
    }, []);

    const handleSave = useCallback(async (shouldClose = false) => {
        try {
            setIsSaving(true);
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setHasUnsavedChanges(false);
            
            if (shouldClose) {
                router.back();
            } else {
                Alert.alert('Saved', 'Note saved successfully!');
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save note. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, []);

    const handleClose = useCallback(() => {
        if (hasUnsavedChanges) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Do you want to save before leaving?',
                [
                    { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                    { text: 'Save', onPress: () => handleSave(true) },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        } else {
            router.back();
        }
    }, [hasUnsavedChanges, handleSave]);

    
    const handleAIRespond = useCallback(async () => {
        try {
            setContent(prev => [...prev, { type: 'text', value: '', isAIGenerating: true }]);
            setHasUnsavedChanges(true);
            
            // Simulate AI processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const contentText = content
                .filter(block => block.type === 'text' && !(block as any).isAI)
                .map(block => (block as any).value)
                .filter(value => value.trim())
                .join(' ');
            
            const hasImages = content.some(block => block.type === 'image');
            const hasAudio = content.some(block => block.type === 'audio');
            
            let aiResponse = '';
            if (contentText.toLowerCase().includes('global')) {
                aiResponse = 'Building a global product requires understanding cultural nuances, local regulations, and market preferences. Consider localization beyond language - currency, payment methods, and user behavior patterns vary significantly across regions.';
            } else if (hasImages && hasAudio) {
                aiResponse = 'I can see you have both visual and audio content. This multimodal approach creates rich, engaging experiences. Consider how these elements complement your text to tell a compelling story.';
            } else if (hasImages) {
                aiResponse = 'Visual content can be powerful for storytelling. The images you\'ve included add context and emotional depth to your message.';
            } else if (hasAudio) {
                aiResponse = 'Audio content adds a personal touch and can convey emotion and nuance that text alone cannot capture.';
            } else if (contentText) {
                aiResponse = 'I understand your thoughts. Let me help expand on this idea with some additional insights and perspectives that might be useful.';
            } else {
                aiResponse = 'I\'m ready to help! Share your thoughts, images, or audio, and I\'ll provide relevant insights and suggestions.';
            }
            
            setContent(prev => prev.map((block, index) => 
                index === prev.length - 1 && (block as any).isAIGenerating
                    ? { type: 'text', value: aiResponse, isAI: true }
                    : block
            ));
        } catch (error) {
            console.error('AI response error:', error);
            Alert.alert('Error', 'Failed to generate AI response. Please try again.');
            // Remove the generating block
            setContent(prev => prev.filter(block => !(block as any).isAIGenerating));
        }
    }, [content]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#020F20" />
                    <Text style={styles.loadingText}>Loading note...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top - 8, 0) }]}>
                    <TouchableOpacity 
                        onPress={handleClose} 
                        style={styles.closeButton}
                        accessibilityRole="button"
                        accessibilityLabel="Close editor"
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    {hasUnsavedChanges && (
                        <TouchableOpacity 
                            onPress={() => handleSave()} 
                            style={styles.saveButton}
                            disabled={isSaving}
                            accessibilityRole="button"
                            accessibilityLabel="Save note"
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView 
                    contentContainerStyle={styles.contentContainer} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.timestamp}>{new Date().toLocaleString('en-GB').slice(0, 17)}</Text>

                    {content.map((block, index) => {
                        switch (block.type) {
                            case 'prompt':
                                return <Text key={`p-${index}`} style={styles.promptText}>{(block as any).value}</Text>;
                            case 'text':
                                const isAIGenerating = (block as any).isAIGenerating;
                                const isAI = (block as any).isAI;
                                
                                if (isAIGenerating) {
                                    return (
                                        <View key={`t-${index}`} style={[styles.textBlockContainer, styles.aiGeneratingContainer]}>
                                            <View style={styles.aiGeneratingContent}>
                                                <ActivityIndicator size="small" color="#666" />
                                                <Text style={styles.aiGeneratingText}>AI is thinking...</Text>
                                            </View>
                                        </View>
                                    );
                                }
                                
                                if (isAI) {
                                    return (
                                        <View key={`t-${index}`} style={[styles.textBlockContainer, styles.aiResponseContainer]}>
                                            <Text style={styles.aiLabel}>🤖 Shiro</Text>
                                            <Text style={styles.aiResponseText}>{(block as any).value}</Text>
                                            <TouchableOpacity onPress={() => handleDelete(index)} style={styles.blockDeleteBtn}>
                                                <Text style={styles.blockDeleteX}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }
                                
                                return (
                                    <View key={`t-${index}`} style={styles.textBlockContainer}>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Write something..."
                                            placeholderTextColor="#C7C7CC"
                                            multiline
                                            value={(block as any).value}
                                            onChangeText={(t) => handleTextChange(t, index)}
                                            textAlignVertical="top"
                                        />
                                        {((block as any).value?.length > 0 || content.filter(b => b.type === 'text').length > 1) && (
                                            <TouchableOpacity onPress={() => handleDelete(index)} style={styles.blockDeleteBtn}>
                                                <Text style={styles.blockDeleteX}>✕</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            case 'image':
                                return (
                                    <View key={`i-${index}`} style={{ marginVertical: 16 }}>
                                        <Image source={{ uri: (block as any).url }} style={styles.image} />
                                        <TouchableOpacity onPress={() => handleDelete(index)} style={styles.blockDeleteBtn}>
                                            <Text style={styles.blockDeleteX}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            case 'audio':
                                return (
                                    <AudioCard
                                        key={`a-${index}`}
                                        url={(block as any).url}
                                        duration={(block as any).duration}
                                        transcript={(block as any).transcript}
                                        uploading={(block as any).uploading}
                                        onChangeTranscript={(t) => {
                                            setContent(prev => {
                                                const copy = [...prev];
                                                const b = copy[index] as any;
                                                if (b && b.type === 'audio') b.transcript = t;
                                                return copy;
                                            });
                                        }}
                                        onDelete={() => handleDelete(index)}
                                    />
                                );
                            default: return null;
                        }
                    })}
                </ScrollView>

                {/* Toolbar */}
                <View style={[styles.toolbar, { paddingBottom: insets.bottom + 16 }]}>
                    <TouchableOpacity onPress={() => setShowRecorder(true)}>
                        <Image source={require('../../assets/images/record.png')} style={styles.toolbarIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddText} style={styles.toolbarTextBtn}>
                        <Text style={styles.toolbarTextIcon}>Aa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.respondButton} onPress={handleAIRespond}>
                        <Text style={styles.respondButtonText}>Respond</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddImage}>
                        <Image source={require('../../assets/images/gallery.png')} style={styles.toolbarIcon} />
                    </TouchableOpacity>
                </View>

                <RecordingModal
                    visible={showRecorder}
                    onClose={() => setShowRecorder(false)}
                    onRecorded={handleRecorded}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- Styles（延续你的样式） ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    keyboardAvoidingContainer: { flex: 1 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingTop: 14,
    },
    closeButton: { 
        padding: 14,  // 增加按钮内边距，让点击区域更大
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44,  // 确保最小点击区域
        minHeight: 44
    },
    closeButtonText: { 
        fontSize: 24, 
        color: '#8E8E93', 
        fontWeight: '300',
        lineHeight: 24  // 确保文字垂直居中
    },
    saveButton: {
        backgroundColor: '#020F20',
        paddingHorizontal: 16,
        paddingVertical: 10,  // 调整内边距使其与返回按钮对齐
        borderRadius: 12,
        minWidth: 60,
        minHeight: 44,  // 确保与返回按钮同样高度
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#8E8E93',
        fontSize: 16,
    },
    contentContainer: { paddingHorizontal: 24, paddingBottom: 24 },
    timestamp: { fontSize: 13, color: '#AEAEB2', marginBottom: 24 },
    promptText: { fontSize: 22, lineHeight: 32, color: '#020F20', marginBottom: 24, fontWeight: '600' },
    textBlockContainer: { marginBottom: 16, position: 'relative' },
    textInput: { 
        fontSize: 18, 
        lineHeight: 28, 
        color: '#020F20', 
        minHeight: 100, 
        backgroundColor: '#FAFAFC', 
        borderRadius: 12, 
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F3',
    },
    image: { 
        width: '100%', 
        aspectRatio: 16 / 9, 
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
    },

    toolbar: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        paddingTop: 16,
        borderTopWidth: 1, 
        borderTopColor: '#F2F2F7',
        backgroundColor: '#FFFFFF',
    },
    toolbarIcon: { width: 28, height: 28, resizeMode: 'contain' },
    toolbarTextBtn: { 
        width: 32, 
        height: 32, 
        borderRadius: 16, 
        backgroundColor: '#F2F2F7', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    toolbarTextIcon: { 
        color: '#333', 
        fontSize: 14, 
        fontWeight: '600' 
    },
    respondButton: { 
        backgroundColor: '#333231', 
        borderRadius: 99, 
        paddingVertical: 12, 
        paddingHorizontal: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    respondButtonText: { 
        color: '#FFFFFF', 
        fontSize: 16, 
        fontWeight: '600' 
    },

    // Audio card（升级样式）
    audioContainer: {
        backgroundColor: '#FAFAFC', 
        borderRadius: 20, 
        padding: 16, 
        marginVertical: 16,
        borderWidth: 1, 
        borderColor: '#F0F0F3', 
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    audioTopRow: { flexDirection: 'row', alignItems: 'center' },
    audioPlayBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        backgroundColor: '#000', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginRight: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    audioPlayBtnActive: {
        backgroundColor: '#333',
        transform: [{ scale: 0.95 }],
    },
    audioPlayIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
    audioInfo: { flex: 1 },
    progressContainer: { marginBottom: 8 },
    progressTrack: { 
        height: 6, 
        borderRadius: 6, 
        backgroundColor: '#E5E5EA', 
        overflow: 'hidden',
        position: 'relative'
    },
    progressFill: { 
        height: '100%', 
        backgroundColor: '#000',
        borderRadius: 6,
    },
    progressThumb: {
        position: 'absolute',
        top: -3,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#000',
        marginLeft: -6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    timeText: { color: '#333', fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
    audioDurationText: { color: '#666', fontSize: 12, fontVariant: ['tabular-nums'] },
    transcriptContainer: {
        marginTop: 12,
    },
    audioTranscriptText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#020F20',
        marginBottom: 4,
    },
    showMoreButton: {
        alignSelf: 'flex-start',
        marginTop: 4,
        marginBottom: 8,
    },
    showMoreText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    audioTranscriptInput: { 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        padding: 12, 
        fontSize: 15, 
        lineHeight: 22, 
        color: '#020F20',
        borderWidth: 1,
        borderColor: '#F0F0F3',
        marginTop: 8,
        minHeight: 80,
    },

    // 删除按钮
    blockDeleteBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: 'rgba(0,0,0,0.08)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    blockDeleteX: { color: '#222', fontSize: 16, fontWeight: '600' },

    // 录音 Modal
    modalMask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'flex-end' },
    modalSheet: { width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 24 },
    modalTitle: { fontSize: 16, color: '#020F20', fontWeight: '600' },
    modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalCancel: { backgroundColor: '#EAEAF0', marginRight: 8 },
    modalStopDark: { backgroundColor: '#000', marginLeft: 8 },
    modalBtnText: { color: '#fff', fontWeight: '600' },
    modalBtnTextDark: { color: '#111', fontWeight: '600' },

    uploadingMask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    uploadingText: { marginTop: 8, color: '#333', fontSize: 14, fontWeight: '500' },
    
    // AI 相关样式
    aiGeneratingContainer: { 
        backgroundColor: '#F0F8FF', 
        borderRadius: 16, 
        padding: 16, 
        borderWidth: 1, 
        borderColor: '#E0E7FF' 
    },
    aiGeneratingContent: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 60 
    },
    aiGeneratingText: { 
        marginLeft: 12, 
        color: '#666', 
        fontSize: 15, 
        fontStyle: 'italic' 
    },
    aiResponseContainer: { 
        backgroundColor: '#F8F9FF', 
        borderRadius: 16, 
        padding: 16, 
        borderWidth: 1, 
        borderColor: '#E8E9FF',
        borderLeftWidth: 4,
        borderLeftColor: '#4F46E5',
    },
    aiLabel: { 
        fontSize: 13, 
        fontWeight: '600', 
        color: '#4F46E5', 
        marginBottom: 8 
    },
    aiResponseText: { 
        fontSize: 16, 
        lineHeight: 24, 
        color: '#374151' 
    },
});
