// components/AudioPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

type AudioBlock = { type: 'audio'; url: string; duration: string; transcript?: string };
interface Props { audioBlock: AudioBlock; variant?: 'full' | 'compact'; }

const AudioPlayer: React.FC<Props> = ({ audioBlock, variant = 'full' }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const hasUrl = !!audioBlock.url;

    async function ensureLoaded() {
        if (!hasUrl || loaded || soundRef.current) return;
        const { sound } = await Audio.Sound.createAsync({ uri: audioBlock.url }, { shouldPlay: false });
        soundRef.current = sound;
        setLoaded(true);
    }

    async function handlePlayPause() {
        if (!hasUrl) return;
        await ensureLoaded();
        if (!soundRef.current) return;
        const status = await soundRef.current.getStatusAsync();
        if ('isPlaying' in status && status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
        } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
        }
    }

    useEffect(() => () => { soundRef.current?.unloadAsync(); }, []);

    const compact = variant === 'compact';
    return (
        <TouchableOpacity
            onPress={handlePlayPause}
            activeOpacity={hasUrl ? 0.85 : 1}
            disabled={!hasUrl}
            style={[
                styles.shell,
                compact ? styles.compact : styles.full,
                !hasUrl && { opacity: 0.5 },
            ]}
        >
            <View style={styles.row}>
                <View style={styles.playPill}><Text style={styles.playTxt}>{isPlaying ? '⏸' : '▶'}</Text></View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.wave} numberOfLines={1}>▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪</Text>
                    {!compact && !!audioBlock.transcript && (
                        <Text style={styles.sub} numberOfLines={2}>{audioBlock.transcript}</Text>
                    )}
                </View>
                <Text style={styles.duration}>{audioBlock.duration}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    shell: {
        borderRadius: 16,
        backgroundColor: '#EFF1F5', // 柔和灰
        borderWidth: 1,
        borderColor: '#E2E6EE',
    },
    compact: { paddingVertical: 10, paddingHorizontal: 12 },
    full: { paddingVertical: 14, paddingHorizontal: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    playPill: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#D8DEE9', alignItems: 'center', justifyContent: 'center',
    },
    playTxt: { color: '#2C3440', fontSize: 16, fontWeight: '600' },
    wave: { color: '#6A7381', fontSize: 12 },
    sub: { color: '#8A94A6', fontSize: 11, marginTop: 6 },
    duration: { color: '#2C3440', fontSize: 12, fontVariant: ['tabular-nums'] },
});
export default AudioPlayer;
