import React, { useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.80;
const OPEN_X = 0;
const CLOSED_X = DRAWER_WIDTH;

// 用于给进度条做动画的可动画渐变
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface ProfileDrawerProps {
    visible: boolean;
    onClose: () => void;
}

export default function ProfileDrawer({ visible, onClose }: ProfileDrawerProps) {
    const insets = useSafeAreaInsets();
    const translateX = useSharedValue<number>(CLOSED_X);

    // 目标使用率（0.75 = 75%）
    const TARGET_PROGRESS = 0.75;
    const progress = useSharedValue<number>(0);

    // 页面跳转
    const handleDiscord = () => router.push('/screens/DiscordLink');
    const handleTelegram = () => router.push('/screens/Telegram');
    const handlePassword = () => router.push('/screens/PasswordLock');
    const handleFeedBack = () => router.push('/screens/Feedback');

    // 打开/关闭动画 + 进度条动画
    useEffect(() => {
        if (visible) {
            translateX.value = withSpring(OPEN_X, { damping: 14, stiffness: 160 });
            // 先复位到 0，再延迟启动到 75%
            progress.value = 0;
            progress.value = withDelay(
                120,
                withTiming(TARGET_PROGRESS, {
                    duration: 900,
                    easing: Easing.out(Easing.cubic),
                })
            );
        } else {
            translateX.value = withTiming(CLOSED_X, { duration: 260 });
            progress.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    // 手势：仅允许向右拖拽关闭
    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            const dx = Math.max(0, event.translationX);
            translateX.value = Math.min(CLOSED_X, dx);
        })
        .onEnd((event) => {
            const shouldClose =
                translateX.value > DRAWER_WIDTH * 0.28 || event.velocityX > 600;

            if (shouldClose) {
                translateX.value = withTiming(CLOSED_X, { duration: 220 }, () => {
                    runOnJS(onClose)();
                });
                progress.value = withTiming(0, { duration: 200 });
            } else {
                translateX.value = withSpring(OPEN_X, { damping: 16, stiffness: 180 });
            }
        });

    // 遮罩透明度（随抽屉位移线性变化）
    const backdropOpacity = useDerivedValue(() =>
        interpolate(translateX.value, [OPEN_X, CLOSED_X], [0.28, 0], Extrapolate.CLAMP)
    );

    // 抽屉阴影/圆角随位移细微变化
    const drawerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        shadowOpacity: interpolate(
            translateX.value,
            [OPEN_X, CLOSED_X],
            [0.18, 0.04],
            Extrapolate.CLAMP
        ),
        borderTopLeftRadius: interpolate(
            translateX.value,
            [OPEN_X, CLOSED_X],
            [24, 36],
            Extrapolate.CLAMP
        ),
        borderBottomLeftRadius: interpolate(
            translateX.value,
            [OPEN_X, CLOSED_X],
            [24, 36],
            Extrapolate.CLAMP
        ),
    }));

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    // 进度条填充宽度动画（0 → 75%）
    const progressFillStyle = useAnimatedStyle(() => ({
        width: `${Math.round(progress.value * 100)}%`,
    }));

    return (
        <>
            {/* 遮罩：可点击关闭，带渐隐 */}
            <Animated.View
                pointerEvents={visible ? 'auto' : 'none'}
                style={[styles.overlay, overlayAnimatedStyle]}
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        translateX.value = withTiming(CLOSED_X, { duration: 220 }, () => {
                            runOnJS(onClose)();
                        });
                        progress.value = withTiming(0, { duration: 200 });
                    }}
                />
            </Animated.View>

            {/* 抽屉 */}
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            paddingTop: Math.max(insets.top, 16) + 28,
                            width: DRAWER_WIDTH,
                        },
                        drawerAnimatedStyle,
                    ]}
                >
                    {/* 背景淡渐变 */}
                    <LinearGradient
                        colors={['#FFFFFF', '#FAFAFB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                    />

                    {/* 顶部拉手 */}
                    <View style={styles.handle} />

                    {/* 头像 + 名字 */}
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

                    {/* 使用情况卡片 */}
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
                                    You&#39;ve used 8 AI conversations this month. Upgrade for unlimited access.
                                </Text>

                                <Pressable style={({ pressed }) => [
                                    styles.upgradeButton,
                                    pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                                ]}>
                                    <Text style={styles.upgradeText}>Upgrade to Pro</Text>
                                </Pressable>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* 菜单（带视差） */}
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
                            onPress={() => router.push('/')}
                        />
                    </View>
                </Animated.View>
            </GestureDetector>
        </>
    );
}

function MenuItem({
                      icon,
                      label,
                      onPress,
                      index,
                      translateX,
                  }: {
    icon: any;
    label: string;
    onPress?: () => void;
    index: number;
    translateX: SharedValue<number>;
}) {
    // 视差：抽屉关闭时每项有不同的初始偏移，打开时归零；同时做轻微淡入
    const itemAnimatedStyle = useAnimatedStyle(() => {
        // 每一项多一点偏移，形成层次
        const baseOffset = 12 + index * 5;
        const dx = interpolate(
            translateX.value,
            [OPEN_X, CLOSED_X],
            [0, baseOffset],
            Extrapolate.CLAMP
        );
        const op = interpolate(
            translateX.value,
            [OPEN_X, CLOSED_X * 0.6, CLOSED_X],
            [1, 0.6, 0],
            Extrapolate.CLAMP
        );
        return {
            transform: [{ translateX: dx }],
            opacity: op,
        };
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
            >
                <Image source={icon} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{label}</Text>
                <View style={styles.menuSpacer} />
                <Text style={styles.chevron}>{'›'}</Text>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        opacity: 0, // 交给动画控制
        zIndex: 999,
    },
    drawer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,

        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,

        // 阴影
        shadowColor: '#000',
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
        left: 10,
        top: 12,
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.12)',
    },

    profileHeader: {
        alignItems: 'center',
        marginBottom: 28,
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
        marginTop: 14,
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: 0.2,
    },

    usageWrap: {
        alignSelf: 'stretch',
        width: '100%',
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    usageBox: {
        borderRadius: 16,
        padding: 1, // 给描边渐变留空间
    },
    usageBoxInner: {
        borderRadius: 16,
        padding: 18,
        backgroundColor: '#0E1320',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    usageTitle: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 12,
        letterSpacing: 0.2,
    },

    progressBarContainer: {
        width: '100%',
        marginBottom: 8,
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
        borderRadius: 6,
    },

    usageHint: {
        color: 'rgba(245,245,245,0.85)',
        fontSize: 12,
        lineHeight: 16,
        marginTop: 8,
    },
    upgradeButton: {
        backgroundColor: '#F5F7FF',
        paddingVertical: 10,
        borderRadius: 999,
        marginTop: 10,
        alignItems: 'center',
    },
    upgradeText: {
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: 0.3,
    },

    menuList: {
        gap: 16,
        marginTop: 6,
    },
    menuItemWrap: {
        borderRadius: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 6,
        borderRadius: 12,
    },
    menuIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
        marginRight: 10,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    menuSpacer: {
        flex: 1,
    },
    chevron: {
        fontSize: 22,
        color: 'rgba(15,23,42,0.35)',
        marginLeft: 6,
        marginRight: 2,
    },
});
