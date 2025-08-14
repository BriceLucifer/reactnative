/**
 * @fileoverview ProfileDrawer component - slide-out navigation drawer
 * 
 * Optimized with proper TypeScript, performance enhancements,
 * and consistent styling patterns.
 */

import React, { useEffect, useCallback, memo } from 'react';
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
    Easing,
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalProps, COLORS, SPACING, ANIMATIONS, LAYOUT } from '@/types';

// Constants
const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * LAYOUT.DRAWER_WIDTH_PERCENTAGE;
const OPEN_X = 0;
const CLOSED_X = DRAWER_WIDTH;
const TARGET_PROGRESS = 0.75;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Component types
type ProfileDrawerProps = ModalProps;

interface MenuItemProps {
    icon: any;
    label: string;
    onPress?: () => void;
    index: number;
    translateX: SharedValue<number>;
}

// Menu Item Component
const MenuItem = memo<MenuItemProps>(({ icon, label, onPress, index, translateX }) => {
    const itemAnimatedStyle = useAnimatedStyle(() => {
        const baseOffset = 12 + index * 5;
        const dx = interpolate(translateX.value, [OPEN_X, CLOSED_X], [0, baseOffset], Extrapolate.CLAMP);
        const op = interpolate(translateX.value, [OPEN_X, CLOSED_X * 0.6, CLOSED_X], [1, 0.6, 0], Extrapolate.CLAMP);
        return { transform: [{ translateX: dx }], opacity: op };
    });

    return (
        <Animated.View style={[styles.menuItemWrap, itemAnimatedStyle]}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { opacity: 0.7, transform: [{ translateY: 0.5 }] },
                ]}
                android_ripple={{ borderless: false }}
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                <Image source={icon} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{label}</Text>
                <View style={styles.menuSpacer} />
                <Text style={styles.chevron}>&rsquo;</Text>
            </Pressable>
        </Animated.View>
    );
});

MenuItem.displayName = 'MenuItem';

// Main Component
const ProfileDrawer = memo<ProfileDrawerProps>(({ visible, onClose }) => {
    const insets = useSafeAreaInsets();
    const translateX = useSharedValue<number>(CLOSED_X);
    const progress = useSharedValue<number>(0);

    // Navigation handlers with proper error handling
    const handleGetPro = useCallback(() => {
        try {
            onClose();
            setTimeout(() => { 
                router.push('/screens/GetShiroPro'); 
            }, ANIMATIONS.TIMING_CONFIG.duration);
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, [onClose]);

    const handleDiscord = useCallback(() => {
        try {
            router.push('/screens/DiscordLink');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    const handleTelegram = useCallback(() => {
        try {
            router.push('/screens/Telegram');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    const handlePassword = useCallback(() => {
        try {
            router.push('/screens/PasswordLock');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    const handleFeedBack = useCallback(() => {
        try {
            router.push('/screens/Feedback');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    const handleSignOut = useCallback(() => {
        try {
            router.push('/');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            translateX.value = withSpring(OPEN_X, ANIMATIONS.SPRING_CONFIG);
            progress.value = 0;
            progress.value = withDelay(120, withTiming(TARGET_PROGRESS, {
                duration: 900,
                easing: Easing.out(Easing.cubic),
            }));
        } else {
            translateX.value = withTiming(CLOSED_X, { duration: 260 });
            progress.value = withTiming(0, { duration: 200 });
        }
    }, [visible, translateX, progress]);

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            const dx = Math.max(0, event.translationX);
            translateX.value = Math.min(CLOSED_X, dx);
        })
        .onEnd((event) => {
            const shouldClose = translateX.value > DRAWER_WIDTH * ANIMATIONS.GESTURE_CONFIG.threshold || 
                               event.velocityX > ANIMATIONS.GESTURE_CONFIG.velocity;
            if (shouldClose) {
                translateX.value = withTiming(CLOSED_X, { duration: 220 }, () => {
                    runOnJS(onClose)();
                });
                progress.value = withTiming(0, { duration: 200 });
            } else {
                translateX.value = withSpring(OPEN_X, {
                    damping: 16,
                    stiffness: 180,
                });
            }
        });

    // Derived values for animations
    const backdropOpacity = useDerivedValue(() =>
        interpolate(translateX.value, [OPEN_X, CLOSED_X], [1, 0], Extrapolate.CLAMP)
    );

    const drawerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        shadowOpacity: interpolate(translateX.value, [OPEN_X, CLOSED_X], [0.18, 0.04], Extrapolate.CLAMP),
        borderTopLeftRadius: interpolate(translateX.value, [OPEN_X, CLOSED_X], [24, 36], Extrapolate.CLAMP),
        borderBottomLeftRadius: interpolate(translateX.value, [OPEN_X, CLOSED_X], [24, 36], Extrapolate.CLAMP),
    }));

    const overlayAnimatedStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

    const progressFillStyle = useAnimatedStyle(() => ({
        width: `${Math.round(progress.value * 100)}%`,
    }));

    return (
        <>
            {/* Background overlay with blur effect */}
            <Animated.View
                pointerEvents={visible ? 'auto' : 'none'}
                style={[styles.overlay, overlayAnimatedStyle]}
            >
                <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0,0,0,0.22)' }
                    ]}
                />
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            </Animated.View>

            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[
                        styles.drawer,
                        { paddingTop: Math.max(insets.top, 16) + 28, width: DRAWER_WIDTH },
                        drawerAnimatedStyle,
                    ]}
                >
                    <LinearGradient
                        colors={['#FFFFFF', '#FAFAFB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                    />

                    <View style={styles.handle} />

                    <View style={styles.profileHeader}>
                        <View style={styles.avatarRing}>
                            <LinearGradient
                                colors={['#D7E6FF', '#EDE7FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.avatarCircle}
                            >
                                <Text style={styles.avatarText}>M</Text>
                            </LinearGradient>
                        </View>
                        <Text style={styles.name}>Mike</Text>
                    </View>

                    <View style={styles.usageWrap}>
                        <LinearGradient
                            colors={['#0F172A', '#0B1220']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.usageBox}
                        >
                            <View style={styles.usageBoxInner}>
                                <Text style={styles.usageTitle}>Free Plan Usage</Text>

                                <View style={styles.progressBarContainer}>
                                    <View style={styles.progressTrack}>
                                        <AnimatedLinearGradient
                                            colors={['#B7F3FF', '#74C8FF']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={[styles.progressFill, progressFillStyle]}
                                        />
                                    </View>
                                </View>

                                <Text style={styles.usageHint}>
                                    You&rsquo;ve used 8 AI conversations this month. Upgrade for unlimited access.
                                </Text>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.upgradeButton,
                                        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                                    ]}
                                    onPress={handleGetPro}
                                    accessibilityRole="button"
                                    accessibilityLabel="Upgrade to Pro"
                                >
                                    <Text style={styles.upgradeText}>Upgrade to Pro</Text>
                                </Pressable>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.menuList}>
                        <MenuItem 
                            index={0} 
                            translateX={translateX} 
                            icon={require('../assets/images/discord.png')} 
                            label="Discord" 
                            onPress={handleDiscord} 
                        />
                        <MenuItem 
                            index={1} 
                            translateX={translateX} 
                            icon={require('../assets/images/telegram.png')} 
                            label="Telegram" 
                            onPress={handleTelegram} 
                        />
                        <MenuItem 
                            index={2} 
                            translateX={translateX} 
                            icon={require('../assets/images/lock.png')} 
                            label="Password Lock" 
                            onPress={handlePassword} 
                        />
                        <MenuItem 
                            index={3} 
                            translateX={translateX} 
                            icon={require('../assets/images/feedback.png')} 
                            label="Feedback" 
                            onPress={handleFeedBack} 
                        />
                        <MenuItem 
                            index={4} 
                            translateX={translateX} 
                            icon={require('../assets/images/logout.png')} 
                            label="Sign out" 
                            onPress={handleSignOut} 
                        />
                    </View>
                </Animated.View>
            </GestureDetector>
        </>
    );
});

ProfileDrawer.displayName = 'ProfileDrawer';

const styles = StyleSheet.create({
    // Overlay with blur effect
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        opacity: 0,
        zIndex: 999,
    },
    drawer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: SPACING.LG,
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: -4, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 12,
        zIndex: 1000,
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        overflow: 'hidden',
    },
    handle: {
        position: 'absolute',
        left: SPACING.SM + 2,
        top: SPACING.MD,
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.12)',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: SPACING.XL + 4,
    },
    avatarRing: {
        padding: 2,
        borderRadius: 44,
        backgroundColor: '#EEF2FF',
    },
    avatarCircle: {
        width: 82,
        height: 82,
        borderRadius: 41,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 34,
        fontWeight: '800',
        color: '#263238',
    },
    name: {
        marginTop: SPACING.MD - 2,
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: 0.2,
    },
    usageWrap: {
        alignSelf: 'stretch',
        width: '100%',
        marginBottom: SPACING.LG,
        borderRadius: 16,
        overflow: 'hidden',
    },
    usageBox: {
        borderRadius: 16,
        padding: 1,
    },
    usageBoxInner: {
        borderRadius: 16,
        padding: 18,
        backgroundColor: '#0E1320',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    usageTitle: {
        color: COLORS.WHITE,
        fontWeight: '700',
        fontSize: 16,
        marginBottom: SPACING.MD,
        letterSpacing: 0.2,
    },
    progressBarContainer: {
        width: '100%',
        marginBottom: SPACING.SM,
    },
    progressTrack: {
        width: '100%',
        height: 10,
        borderRadius: 6,
        backgroundColor: '#1C2433',
        overflow: 'hidden',
    },
    progressFill: { 
        height: '100%', 
        borderRadius: 6 
    },
    usageHint: {
        color: 'rgba(245,245,245,0.85)',
        fontSize: 12,
        lineHeight: 16,
        marginTop: SPACING.SM,
    },
    upgradeButton: {
        backgroundColor: '#F5F7FF',
        paddingVertical: SPACING.SM + 2,
        borderRadius: 999,
        marginTop: SPACING.SM + 2,
        alignItems: 'center',
    },
    upgradeText: {
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: 0.3,
    },
    menuList: { 
        gap: SPACING.MD, 
        marginTop: 6 
    },
    menuItemWrap: { 
        borderRadius: LAYOUT.BUTTON_BORDER_RADIUS 
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.MD,
        paddingHorizontal: 6,
        borderRadius: LAYOUT.BUTTON_BORDER_RADIUS,
    },
    menuIcon: { 
        width: 28, 
        height: 28, 
        resizeMode: 'contain', 
        marginRight: SPACING.SM + 2 
    },
    menuLabel: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#0F172A' 
    },
    menuSpacer: { 
        flex: 1 
    },
    chevron: { 
        fontSize: 22, 
        color: 'rgba(15,23,42,0.35)', 
        marginLeft: 6, 
        marginRight: 2 
    },
});

export default ProfileDrawer;