import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    Image, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Modal, Animated, ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Audio, AVPlaybackStatusSuccess, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

// --- Types ---
export type ContentBlock =
    | { type: 'text'; value: string }
    | { type: 'image'; url: string }
    | { type: 'audio'; url: string; duration: string; transcript?: string; uploading?: boolean };
export interface Note { id: string; updatedAt: string; content: ContentBlock[]; }
type EditorContentBlock = ContentBlock | { type: 'prompt'; value: string };

// ✅ 你的 Appwrite 本地音频 URL
const LOCAL_ADMIN_AUDIO_URL =
    'http://localhost/v1/storage/buckets/689b2283000a1eb4930c/files/689b2294000e0c2dfbbc/view?project=688a534b000dacc7f1c8&mode=admin';

// --- Fake DB（仅当前屏用来演示） ---
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
            // 👇 改成你给的可播 URL
            { type: 'audio', url: LOCAL_ADMIN_AUDIO_URL, duration: '00:12' },
        ],
    },
    {
        id: '5',
        updatedAt: '2025/08/11 10:24',
        content: [
            { type: 'text', value: 'This note has multiple images and audio.' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/04/24/01/29/trees-9554109_1280.jpg' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' },
            // 👇 同样用可播 URL
            { type: 'audio', url: LOCAL_ADMIN_AUDIO_URL, duration: '00:12' },
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
function AudioCard({
                       url, duration, transcript, uploading, onChangeTranscript, onDelete,
                   }: {
    url: string; duration: string; transcript?: string; uploading?: boolean;
    onChangeTranscript?: (t: string) => void; onDelete?: () => void;
}) {
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lenMs, setLenMs] = useState(0);
    const [posMs, setPosMs] = useState(0);

    useEffect(() => () => { if (soundRef.current) soundRef.current.unloadAsync(); }, []);

    const ensureSound = async () => {
        if (soundRef.current) return soundRef.current;
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
                    setPosMs(s.positionMillis);
                    if (s.durationMillis) setLenMs(s.durationMillis);
                    if (s.didJustFinish) setIsPlaying(false);
                }
            }
        );
        soundRef.current = sound;
        return sound;
    };

    const togglePlay = async () => {
        if (uploading) return;
        const sound = await ensureSound();
        const st = await sound.getStatusAsync() as AVPlaybackStatusSuccess;
        if (!st.isLoaded) return;
        if (st.isPlaying) await sound.pauseAsync(); else await sound.playAsync();
    };

    const progressPct = lenMs ? Math.min(1, posMs / lenMs) : 0;

    return (
        <View style={styles.audioContainer}>
            <View style={styles.audioTopRow}>
                <TouchableOpacity onPress={togglePlay} disabled={!!uploading} style={styles.audioPlayBtn}>
                    <Text style={styles.audioPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
                <View style={styles.audioInfo}>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
                    </View>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{mmss(posMs)}</Text>
                        <Text style={styles.timeText}>{duration}</Text>
                    </View>
                </View>
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} style={styles.blockDeleteBtn}>
                        <Text style={styles.blockDeleteX}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TextInput
                style={styles.audioTranscript}
                placeholder="Transcribed text… (editable)"
                placeholderTextColor="#8E8E93"
                multiline
                value={transcript ?? ''}
                onChangeText={onChangeTranscript}
                editable={!uploading}
            />

            {uploading && (
                <View style={styles.uploadingMask}>
                    <ActivityIndicator />
                    <Text style={{ marginTop: 6, color: '#111' }}>Uploading…</Text>
                </View>
            )}
        </View>
    );
}

// --- Recording Modal（保留，黑色多层波纹，可先不点）---
function RecordingModal({
                            visible, onClose, onRecorded,
                        }: {
    visible: boolean; onClose: () => void;
    onRecorded: (uri: string, durationMs: number, transcript?: string) => void;
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
    const stopBreathing = () => { if (breathingAnim.current) breathingAnim.current.stop(); coreScale.setValue(1); };

    useEffect(() => {
        mountedRef.current = visible;
        if (!visible) return;

        (async () => {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') { Alert.alert('Permission Required', 'Microphone access is required.'); onClose(); return; }

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
        })();

        return () => {
            mountedRef.current = false;
            if (statusTimer.current) clearInterval(statusTimer.current);
            if (meterTimer.current) clearInterval(meterTimer.current);
            stopBreathing();
        };
    }, [visible]);

    const stopAndSave = async () => {
        if (statusTimer.current) clearInterval(statusTimer.current);
        if (meterTimer.current) clearInterval(meterTimer.current);
        stopBreathing();
        if (!recording) return;

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI() ?? '';
        const st = await recording.getStatusAsync();
        const ms = (st as any).durationMillis ?? 0;
        onRecorded(uri, ms, '');
        onClose();
    };

    const cancel = async () => {
        if (statusTimer.current) clearInterval(statusTimer.current);
        if (meterTimer.current) clearInterval(meterTimer.current);
        stopBreathing();
        if (recording) await recording.stopAndUnloadAsync().catch(() => {});
        onClose();
    };

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
}

export default function NoteEditorScreen() {
    const { noteId } = useLocalSearchParams<{ noteId?: string }>();
    const [content, setContent] = useState<EditorContentBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showRecorder, setShowRecorder] = useState(false);

    useEffect(() => {
        if (noteId) {
            const existingNote = FAKE_NOTES_DATABASE.find(n => n.id === noteId);
            if (existingNote) setContent(existingNote.content);
        } else {
            const now = new Date();
            const greeting = `Good ${now.getHours() < 12 ? 'morning' : 'afternoon'}, Mike.`;
            setContent([{ type: 'prompt', value: `${greeting}\nWhat's on your mind?` }, { type: 'text', value: '' }]);
        }
        setIsLoading(false);
    }, [noteId]);

    const handleTextChange = (newText: string, blockIndex: number) => {
        setContent(prev => {
            const copy = [...prev];
            const b = copy[blockIndex];
            if (b && b.type === 'text') (b as any).value = newText;
            return copy;
        });
    };

    const handleAddImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== 'granted') { Alert.alert('Permission Required', 'Please grant Photo access.'); return; }
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.92,
            selectionLimit: 1,
        });
        if (res.canceled) return;
        const uri = res.assets?.[0]?.uri; if (!uri) return;
        setContent(prev => [...prev, { type: 'image', url: uri }]);
    };

    const handleDelete = (idx: number) => setContent(prev => prev.filter((_, i) => i !== idx));

    const handleRecorded = (localUri: string, durationMs: number, transcript?: string) => {
        const blk: ContentBlock = { type: 'audio', url: localUri, duration: mmss(durationMs), transcript: transcript ?? '' };
        setContent(prev => [...prev, blk]);
    };

    const handleClose = () => router.back();
    const handleSave = () => Alert.alert('Saved', 'Note saved (demo).');

    if (isLoading) return <View style={styles.container}><Text>Loading...</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
                    <Text style={styles.timestamp}>{new Date().toLocaleString('en-GB').slice(0, 17)}</Text>

                    {content.map((block, index) => {
                        switch (block.type) {
                            case 'prompt':
                                return <Text key={`p-${index}`} style={styles.promptText}>{(block as any).value}</Text>;
                            case 'text':
                                return (
                                    <View key={`t-${index}`} style={{ marginBottom: 16 }}>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Write something..."
                                            placeholderTextColor="#C7C7CC"
                                            multiline
                                            value={(block as any).value}
                                            onChangeText={(t) => handleTextChange(t, index)}
                                        />
                                        <TouchableOpacity onPress={() => handleDelete(index)} style={styles.blockDeleteBtn}>
                                            <Text style={styles.blockDeleteX}>✕</Text>
                                        </TouchableOpacity>
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
                <View style={styles.toolbar}>
                    <TouchableOpacity onPress={() => setShowRecorder(true)}>
                        <Image source={require('../../assets/images/record.png')} style={styles.toolbarIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.respondButton} onPress={handleSave}>
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
    header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
    closeButton: { padding: 8 },
    closeButtonText: { fontSize: 24, color: '#8E8E93', fontWeight: '300' },
    contentContainer: { paddingHorizontal: 24, paddingBottom: 24 },
    timestamp: { fontSize: 13, color: '#AEAEB2', marginBottom: 24 },
    promptText: { fontSize: 22, lineHeight: 32, color: '#020F20', marginBottom: 24, fontWeight: '600' },
    textInput: { fontSize: 18, lineHeight: 28, color: '#020F20', minHeight: 100, backgroundColor: '#FAFAFC', borderRadius: 12, padding: 12 },
    image: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16 },

    toolbar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    toolbarIcon: { width: 28, height: 28, resizeMode: 'contain' },
    respondButton: { backgroundColor: '#333231', borderRadius: 99, paddingVertical: 16, paddingHorizontal: 40 },
    respondButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

    // Audio card（黑色风）
    audioContainer: {
        backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 16, padding: 12, marginVertical: 16,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', overflow: 'hidden'
    },
    audioTopRow: { flexDirection: 'row', alignItems: 'center' },
    audioPlayBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    audioPlayIcon: { color: '#fff', fontSize: 16, fontWeight: '600' },
    audioInfo: { flex: 1 },
    progressTrack: { height: 8, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.12)', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#000' },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    timeText: { color: '#222', fontSize: 12, fontVariant: ['tabular-nums'] },
    audioTranscript: { marginTop: 10, backgroundColor: '#fff', borderRadius: 12, padding: 10, fontSize: 16, lineHeight: 24, color: '#020F20' },

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

    uploadingMask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
});
