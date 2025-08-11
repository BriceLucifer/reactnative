// File: components/NoteCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

// --- Type Definitions ---
export type ContentBlock =
    | { type: 'text'; value: string }
    | { type: 'image'; url: string | ImageSourcePropType }
    | { type: 'audio'; url: string; duration: string };

export interface Note {
    id: string;
    updatedAt: string;
    content: ContentBlock[];
}

// --- Child Components & Props ---
interface AudioPreviewProps {
    audio: Extract<ContentBlock, { type: 'audio' }>;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ audio }) => (
    <View style={styles.audioContainer}>
        <Text style={styles.audioPlayIcon}>▶</Text>
        <Text style={styles.audioWaveform}>|||..|...||.|||...|..|||</Text>
        <Text style={styles.audioDuration}>{audio.duration}</Text>
    </View>
);

interface NoteCardProps {
    note: Note;
    onPress: () => void;
    onDelete: () => void;
}

// --- Main Component ---
const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, onDelete }) => {
    const textContent = note.content.find((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')?.value || '';
    const imageBlocks = note.content.filter((block): block is Extract<ContentBlock, { type: 'image' }> => block.type === 'image');
    const audioContent = note.content.find((block): block is Extract<ContentBlock, { type: 'audio' }> => block.type === 'audio');

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [0, 80],
            extrapolate: 'clamp',
        });
        return (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Animated.View style={{ transform: [{ translateX: trans }] }}>
                    <Text style={{color: '#FF3B30', fontSize: 18}}>Delete</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable renderRightActions={renderRightActions}>
            <Pressable onPress={onPress} style={styles.cardContainer}>
                <Text style={styles.timestamp}>{note.updatedAt}</Text>
                {textContent ? <Text style={styles.textContent}>{textContent}</Text> : null}

                {imageBlocks.length > 0 && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={typeof imageBlocks[0].url === 'string' ? { uri: imageBlocks[0].url } : imageBlocks[0].url}
                            style={styles.imageContent}
                        />
                        {imageBlocks.length > 1 && (
                            <View style={styles.imageCountBadge}>
                                <Text style={styles.imageCountText}>+{imageBlocks.length - 1}</Text>
                            </View>
                        )}
                    </View>
                )}

                {audioContent && <AudioPreview audio={audioContent} />}
            </Pressable>
        </Swipeable>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFF',
        borderRadius: 32,
        padding: 24,
        marginBottom: 16,
        gap: 8,
        shadowColor: 'rgba(2, 15, 32, 1)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 4,
    },
    timestamp: {
        color: '#AEAEB2',
        fontSize: 13,
    },
    textContent: {
        color: '#020F20',
        fontSize: 16,
        lineHeight: 24,
    },
    imageContainer: {
        width: '100%',
    },
    imageContent: {
        width: '100%',
        height: 180,
        borderRadius: 12,
    },
    imageCountBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    imageCountText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    audioPlayIcon: {
        color: '#020F20',
        fontSize: 14,
        marginRight: 12,
    },
    audioWaveform: {
        flex: 1,
        color: '#C7C7CC',
        letterSpacing: 2,
        overflow: 'hidden',
    },
    audioDuration: {
        color: '#020F20',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 12,
    },
    deleteButton: {
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 16,
        borderRadius: 20,
    },
});

export default NoteCard;