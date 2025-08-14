/**
 * @fileoverview NoteCard component for displaying note previews
 * 
 * Optimized component with proper TypeScript, performance optimizations,
 * and consistent styling patterns.
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Note, ContentBlock, NoteActionProps, COLORS, SPACING } from '@/types';

// Component-specific types
interface NoteCardProps extends NoteActionProps {
    note: Note;
}

interface AudioPreviewProps {
    audio: Extract<ContentBlock, { type: 'audio' }>;
}

// --- Audio Preview Component ---
const AudioPreview = memo<AudioPreviewProps>(({ audio }) => (
    <View style={styles.audioContainer}>
        <Text style={styles.audioPlayIcon}>▶</Text>
        <Text style={styles.audioWaveform}>|||..|...||.|||...|..|||</Text>
        <Text style={styles.audioDuration}>{audio.duration}</Text>
    </View>
));

AudioPreview.displayName = 'AudioPreview';

// --- Main Component ---
const NoteCard = memo<NoteCardProps>(({ note, onPress, onDelete }) => {
    // Extract content with proper typing
    const textContent = note.content.find(
        (block): block is Extract<ContentBlock, { type: 'text' }> => 
            block.type === 'text'
    )?.value || '';
    
    const imageBlocks = note.content.filter(
        (block): block is Extract<ContentBlock, { type: 'image' }> => 
            block.type === 'image'
    );
    
    const audioContent = note.content.find(
        (block): block is Extract<ContentBlock, { type: 'audio' }> => 
            block.type === 'audio'
    );

    // Memoized handlers for performance
    const handlePress = useCallback(() => {
        onPress?.();
    }, [onPress]);

    const handleDelete = useCallback(() => {
        onDelete?.();
    }, [onDelete]);

    const renderRightActions = useCallback(
        (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
            const translateX = dragX.interpolate({
                inputRange: [-80, 0],
                outputRange: [0, 80],
                extrapolate: 'clamp',
            });
            
            return (
                <TouchableOpacity 
                    onPress={handleDelete} 
                    style={styles.deleteButton}
                    accessibilityRole="button"
                    accessibilityLabel="Delete note"
                >
                    <Animated.View style={{ transform: [{ translateX }] }}>
                        <Text style={styles.deleteText}>Delete</Text>
                    </Animated.View>
                </TouchableOpacity>
            );
        },
        [handleDelete]
    );

    return (
        <Swipeable renderRightActions={onDelete ? renderRightActions : undefined}>
            <Pressable 
                onPress={handlePress} 
                style={styles.cardContainer}
                accessibilityRole="button"
                accessibilityLabel={`Note from ${note.updatedAt}`}
            >
                <Text style={styles.timestamp}>{note.updatedAt}</Text>
                
                {textContent && (
                    <Text style={styles.textContent} numberOfLines={3}>
                        {textContent}
                    </Text>
                )}

                {imageBlocks.length > 0 && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={typeof imageBlocks[0].url === 'string' 
                                ? { uri: imageBlocks[0].url } 
                                : imageBlocks[0].url
                            }
                            style={styles.imageContent}
                            resizeMode="cover"
                        />
                        {imageBlocks.length > 1 && (
                            <View style={styles.imageCountBadge}>
                                <Text style={styles.imageCountText}>
                                    +{imageBlocks.length - 1}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {audioContent && <AudioPreview audio={audioContent} />}
            </Pressable>
        </Swipeable>
    );
});

NoteCard.displayName = 'NoteCard';

// --- Styles ---
const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 32,
        padding: SPACING.LG,
        marginBottom: SPACING.MD,
        gap: SPACING.SM,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 4,
    },
    timestamp: {
        color: COLORS.SECONDARY,
        fontSize: 13,
        fontWeight: '400',
    },
    textContent: {
        color: COLORS.PRIMARY,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
    },
    imageContainer: {
        width: '100%',
        position: 'relative',
    },
    imageContent: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
    },
    imageCountBadge: {
        position: 'absolute',
        bottom: SPACING.SM,
        right: SPACING.SM,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
        paddingHorizontal: SPACING.SM,
        paddingVertical: SPACING.XS,
    },
    imageCountText: {
        color: COLORS.WHITE,
        fontSize: 12,
        fontWeight: '600',
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.MD,
    },
    audioPlayIcon: {
        color: COLORS.PRIMARY,
        fontSize: 14,
        marginRight: SPACING.MD,
        fontWeight: '600',
    },
    audioWaveform: {
        flex: 1,
        color: '#C7C7CC',
        letterSpacing: 2,
        fontSize: 12,
        fontFamily: 'monospace',
    },
    audioDuration: {
        color: COLORS.PRIMARY,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: SPACING.MD,
        fontVariant: ['tabular-nums'],
    },
    deleteButton: {
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: SPACING.MD,
        borderRadius: 20,
    },
    deleteText: {
        color: COLORS.ERROR,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NoteCard;