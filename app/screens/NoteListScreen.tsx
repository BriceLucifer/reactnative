import ProfileDrawer from '@/components/ProfileDrawer';
import ChatDialog from '@/components/ChatDialog';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import NoteCard from '@/components/NoteCard';
import { Note } from '@/types';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

// Reanimated
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

const BUTTON_WIDTH = 95;

// --- Header metrics ---
const HEADER_HEIGHT = 64;
const HEADER_TOP_OFFSET = 50; // 你当前喜欢的顶部距离
const LIST_TOP_PADDING = HEADER_TOP_OFFSET + 10; // 列表为浮动头部让出空间

// 动画范围：向下滚动多少像素时完成缩小/渐隐
const COLLAPSE_RANGE = 80;

// Environment configuration
const API_CONFIG = {
    baseURL: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://api.freedomai.fun/v1',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '689c404400138a4a5f2d',
};

// Default audio URL for demo
const DEFAULT_AUDIO_URL = `${API_CONFIG.baseURL}/storage/buckets/689b2283000a1eb4930c/files/689b2294000e0c2dfbbc/view?project=${API_CONFIG.projectId}&mode=admin`;

export default function NoteListScreen() {
    const [isDrawerVisible, setDrawerVisible] = useState(false);
    const [showChatDialog, setShowChatDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [notes, setNotes] = useState<Note[]>([]);

    // Initial demo data
    const initialNotes: Note[] = useMemo(() => [
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
                { type: 'audio', url: DEFAULT_AUDIO_URL, duration: '00:12' },
            ],
        },
        {
            id: '2',
            updatedAt: '2025/06/15 09:15',
            content: [
                { type: 'text', value: 'The key is to master two principles: to maintain the core functions that are universal globally, and to make special adjustments for different regions.' },
            ],
        },
        {
            id: '4',
            updatedAt: '2025/08/11 10:24',
            content: [
                { type: 'text', value: 'If you want to make a product that can go global, it is not enough to just translate the language.' },
                { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' },
            ],
        },
        {
            id: '5',
            updatedAt: '2025/08/11 10:24',
            content: [
                { type: 'text', value: 'This note has multiple images and audio.' },
                { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/04/24/01/29/trees-9554109_1280.jpg'},
                { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' },
                { type: 'audio', url: DEFAULT_AUDIO_URL, duration: '00:12' },
            ],
        },
    ], []);

    // Load notes data
    const loadNotes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // TODO: Replace with actual API call
            // const response = await noteService.getNotes();
            // setNotes(response.data);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotes(initialNotes);
        } catch (err) {
            console.error('Failed to load notes:', err);
            setError('Failed to load notes. Please try again.');
            Alert.alert('Error', 'Failed to load notes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [initialNotes]);

    const refreshNotes = useCallback(async () => {
        try {
            setIsRefreshing(true);
            setError(null);
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setNotes(initialNotes);
        } catch (err) {
            console.error('Failed to refresh notes:', err);
            setError('Failed to refresh notes.');
        } finally {
            setIsRefreshing(false);
        }
    }, [initialNotes]);

    // Load data on mount and when screen comes into focus
    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    useFocusEffect(
        useCallback(() => {
            // Refresh notes when screen comes into focus
            if (notes.length > 0) {
                refreshNotes();
            }
        }, [refreshNotes, notes.length])
    );

    // --- Handlers ---
    const handleDeleteNote = useCallback(async (noteIdToDelete: string) => {
        try {
            // TODO: Add confirmation dialog
            Alert.alert(
                'Delete Note',
                'Are you sure you want to delete this note?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                // TODO: Replace with actual API call
                                // await noteService.deleteNote(noteIdToDelete);
                                setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteIdToDelete));
                            } catch (err) {
                                console.error('Failed to delete note:', err);
                                Alert.alert('Error', 'Failed to delete note. Please try again.');
                            }
                        }
                    }
                ]
            );
        } catch (err) {
            console.error('Delete note error:', err);
        }
    }, []);
    const handleAddNote = useCallback(() => {
        try {
            router.push('/screens/NoteEditorScreen');
        } catch (err) {
            console.error('Navigation error:', err);
        }
    }, []);

    const handleNotePress = useCallback((noteId: string) => {
        try {
            router.push(`/screens/NoteEditorScreen?noteId=${noteId}`);
        } catch (err) {
            console.error('Navigation error:', err);
        }
    }, []);

    const handleAIChat = useCallback(() => {
        setShowChatDialog(true);
    }, []);

    const handleProfile = useCallback(() => {
        setDrawerVisible(true);
    }, []);

    // --- Scroll-driven animation ---
    const scrollY = useSharedValue(0);
    const listRef = useRef<FlatList<Note>>(null);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Header整体：透明度+缩放+微上移
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, COLLAPSE_RANGE], [1, 0], Extrapolate.CLAMP);
        const scale = interpolate(scrollY.value, [0, COLLAPSE_RANGE], [1, 0.92], Extrapolate.CLAMP);
        const translateY = interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0, -8], Extrapolate.CLAMP);
        return { opacity, transform: [{ translateY }, { scale }] };
    });

    // Header 阴影强度随滚动减弱
    const headerShadowAnimatedStyle = useAnimatedStyle(() => {
        const shadowOpacity = interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0.08, 0.02], Extrapolate.CLAMP);
        const elevation = interpolate(scrollY.value, [0, COLLAPSE_RANGE], [10, 4], Extrapolate.CLAMP);
        return { shadowOpacity, elevation };
    });

    // 标题字号/字距随滚动变化
    const appTitleAnimatedStyle = useAnimatedStyle(() => {
        const fontSize = interpolate(scrollY.value, [0, COLLAPSE_RANGE], [34, 28], Extrapolate.CLAMP);
        const letterSpacing = interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0, 0.2], Extrapolate.CLAMP);
        const translateY = interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0, -2], Extrapolate.CLAMP);
        return { fontSize, letterSpacing, transform: [{ translateY }] };
    });

    // --- RENDER ---
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* --- Header (Glass + Animated) --- */}
            <Animated.View
                style={[
                    notes.length === 0 ? styles.header : styles.floatingHeader,
                    styles.glassHeader,
                    headerAnimatedStyle,
                    headerShadowAnimatedStyle,
                ]}
            >
                {/* 磨砂层（加兜底底色，安卓老机更稳） */}
                <BlurView
                    intensity={24}
                    tint="light"
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}
                    pointerEvents="none"
                />
                {/* 半透明提亮渐变 */}
                <LinearGradient
                    colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.15)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
                {/* 内容 */}
                <View style={styles.headerInner}>
                    <Animated.Text
                        style={[styles.appTitle, appTitleAnimatedStyle]}
                        onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
                    >
                        Shiro
                    </Animated.Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleAIChat}
                            accessibilityRole="button"
                            accessibilityLabel="Open AI chat"
                        >
                            <Image source={require('../../assets/images/chat.png')} style={styles.iconImage} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleProfile}
                            accessibilityRole="button"
                            accessibilityLabel="Open profile"
                        >
                            <Image source={require('../../assets/images/profile.png')} style={styles.iconImage} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            {isLoading ? (
                // --- Loading State ---
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#020F20" />
                    <Text style={styles.loadingText}>Loading your notes...</Text>
                </View>
            ) : error ? (
                // --- Error State ---
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorSubtitle}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadNotes}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : notes.length === 0 ? (
                // --- Empty State ---
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateTitle}>You haven&apos;t added anything yet</Text>
                    <Text style={styles.emptyStateSubtitle}>Click on the plus, to add notes</Text>
                    <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={handleAddNote}
                        accessibilityRole="button"
                        accessibilityLabel="Add new note"
                    >
                        <LinearGradient
                            colors={['#4A4849', '#292927']}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.gradient}
                        >
                            <Image source={require('../../assets/images/addnote.png')} style={styles.buttonImage} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                // --- List View ---
                <>
                    <Animated.FlatList
                        ref={listRef as any}
                        data={notes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <NoteCard
                                note={item}
                                onPress={() => handleNotePress(item.id)}
                                onDelete={() => handleDeleteNote(item.id)}
                            />
                        )}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        contentContainerStyle={[styles.listContentContainer, { paddingTop: LIST_TOP_PADDING }]}
                        scrollIndicatorInsets={{ top: LIST_TOP_PADDING, bottom: 0 }}
                        style={{ backgroundColor: '#F8F9FA' }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={refreshNotes}
                                tintColor="#020F20"
                                colors={['#020F20']}
                                progressViewOffset={LIST_TOP_PADDING}
                            />
                        }
                        // Performance optimizations
                        removeClippedSubviews
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        getItemLayout={(_, index) => ({
                            length: 200, // Approximate item height
                            offset: 200 * index,
                            index,
                        })}
                    />
                    <View style={styles.bottomBarContainer}>
                        <BlurView intensity={6} tint="extraLight" style={StyleSheet.absoluteFill} />
                        <TouchableOpacity 
                            style={styles.fab} 
                            onPress={handleAddNote}
                            accessibilityRole="button"
                            accessibilityLabel="Add new note"
                        >
                            <LinearGradient
                                colors={['#4A4849', '#292927']}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={styles.gradient}
                            >
                                <Image source={require('../../assets/images/addnote.png')} style={styles.buttonImage} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* --- Modals & Drawers --- */}
            <ProfileDrawer visible={isDrawerVisible} onClose={() => setDrawerVisible(false)} />
            <ChatDialog visible={showChatDialog} onClose={() => setShowChatDialog(false)} />
        </SafeAreaView>
    );
}

// --- Styles ---
const baseButton = {
    width: BUTTON_WIDTH,
    height: 56,
    borderRadius: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 10,
};

const styles = StyleSheet.create({
    // --- Layout & Header ---
    container: { flex: 1, backgroundColor: '#F8F9FA' },

    // 非浮动：普通页面时给些边距
    header: {
        marginTop: 16,
        marginHorizontal: 16,
    },

    // 浮动头部：与屏幕顶部保持距离，并左右留白
    floatingHeader: {
        position: 'absolute',
        top: HEADER_TOP_OFFSET,
        left: 16,
        right: 16,
        zIndex: 10,
    },

    // 玻璃外壳
    glassHeader: {
        height: HEADER_HEIGHT,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: 'transparent',
    },

    // 头部内部布局
    headerInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },

    appTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#020F20',
        fontFamily: 'Gilroy-Bold',
    },
    headerIcons: { flexDirection: 'row', gap: 10 },
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
    iconImage: { width: 24, height: 24, resizeMode: 'contain' },

    // 列表容器：paddingTop 由动态样式注入
    listContentContainer: { paddingHorizontal: 20, paddingBottom: 100 },

    // --- Loading State ---
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 40 
    },
    loadingText: { 
        marginTop: 16, 
        color: '#8E8E93', 
        fontSize: 16, 
        fontFamily: 'Gilroy-Regular' 
    },

    // --- Error State ---
    errorContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 40 
    },
    errorTitle: { 
        color: '#FF3B30', 
        fontSize: 20, 
        fontWeight: '600', 
        textAlign: 'center', 
        marginBottom: 8, 
        fontFamily: 'Gilroy-SemiBold' 
    },
    errorSubtitle: { 
        color: '#8E8E93', 
        fontSize: 16, 
        textAlign: 'center', 
        marginBottom: 24, 
        fontFamily: 'Gilroy-Regular' 
    },
    retryButton: { 
        backgroundColor: '#020F20', 
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        borderRadius: 12 
    },
    retryButtonText: { 
        color: '#FFFFFF', 
        fontSize: 16, 
        fontWeight: '600', 
        fontFamily: 'Gilroy-SemiBold' 
    },

    // --- Empty State Styles ---
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: -60 },
    emptyStateTitle: { color: '#020F20', fontSize: 24, fontWeight: '600', lineHeight: 32, textAlign: 'center', marginBottom: 12, fontFamily: 'Gilroy-SemiBold' },
    emptyStateSubtitle: { color: '#8E8E93', fontSize: 16, fontWeight: '400', lineHeight: 24, textAlign: 'center', marginBottom: 60, fontFamily: 'Gilroy-Regular' },

    // --- Bottom Bar ---
    bottomBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },

    // --- Unified Button Styles ---
    addButton: {
        ...baseButton,
    },
    fab: {
        ...baseButton,
        marginTop: 15,
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});
