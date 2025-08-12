// (app)/screens/get-pro.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    SafeAreaView,
    ScrollView,
    Image
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// 功能列表项组件 (无变动)
function FeatureItem({ title, description }: { title: string, description: string }) {
    return (
        <View style={styles.featureItem}>
            <Image source={require('@/assets/images/sparkle.png')} style={styles.featureIconImage} />
            <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );
}

// 主屏幕组件
export default function GetShiroPro() {
    const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

    const handleStartPress = () => {
        console.log('Starting purchase for plan:', selectedPlan);
    };

    return (
        <LinearGradient
            colors={['#FFFFFF', '#F8F7FF']}
            style={styles.gradientBackground}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Image source={require('@/assets/images/back.png')} style={styles.backButtonIcon} />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Get Shiro Pro</Text>

                    <View style={styles.featuresList}>
                        <FeatureItem
                            title="Advanced AI Feedback"
                            description="Deeper, personalized insights on your thoughts."
                        />
                        <FeatureItem
                            title="Long-term Memory Chats"
                            description="Shiro remembers everything you share."
                        />
                        <FeatureItem
                            title="Voice-to-Text Transcription"
                            description="Effortlessly turn your voice into entries."
                        />
                        <FeatureItem
                            title="20% Off Annual Plan"
                            description="Commit yearly and save more."
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.planOption,
                            selectedPlan === 'annual' && styles.planOptionSelected,
                            pressed && styles.planOptionPressed
                        ]}
                        onPress={() => setSelectedPlan('annual')}
                    >
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>Save 20% off</Text>
                        </View>
                        <View style={styles.planDetails}>
                            <Text style={styles.planTitle}>Annual</Text>
                            {/* --- 按您的要求修改: 将周期文本的样式与价格对齐 --- */}
                            <Text style={styles.planPrice}>$ 95 <Text style={styles.planPeriod}>/ year</Text></Text>
                        </View>
                        <View style={[styles.selectorCircle, selectedPlan === 'annual' && styles.selectorCircleSelected]}>
                            {selectedPlan === 'annual' && <View style={styles.selectorInnerCircle} />}
                        </View>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.planOption,
                            selectedPlan === 'monthly' && styles.planOptionSelected,
                            pressed && styles.planOptionPressed
                        ]}
                        onPress={() => setSelectedPlan('monthly')}
                    >
                        <View style={styles.planDetails}>
                            <Text style={styles.planTitle}>Monthly</Text>
                            {/* --- 按您的要求修改: 将周期文本的样式与价格对齐 --- */}
                            <Text style={styles.planPrice}>$ 9.9 <Text style={styles.planPeriod}>/ month</Text></Text>
                        </View>
                        <View style={[styles.selectorCircle, selectedPlan === 'monthly' && styles.selectorCircleSelected]}>
                            {selectedPlan === 'monthly' && <View style={styles.selectorInnerCircle} />}
                        </View>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.ctaButton,
                            pressed && styles.ctaButtonPressed
                        ]}
                        onPress={handleStartPress}
                    >
                        <LinearGradient
                            colors={['#4A4849', '#292927']}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaButtonText}>Start</Text>
                        </LinearGradient>
                    </Pressable>

                    {/* --- 按您的要求修改: 使用嵌套 Text 组件来实现部分文本加粗 --- */}
                    <Text style={styles.footerText}>
                        Terms of <Text style={styles.footerLink}>Service</Text> · <Text style={styles.footerLink}>Privacy Policy</Text>
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
    },
    backButton: {
        padding: 8,
    },
    backButtonIcon: {
        width: 24,
        height: 24,
        tintColor: '#000',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#020F20',
        textAlign: 'center',
        marginBottom: 32,
        textShadowColor: 'rgba(2, 15, 32, 0.15)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    featuresList: {
        marginBottom: 40,
        gap: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    featureIconImage: {
        width: 24,
        height: 24,
        tintColor: '#5A42E6',
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    featureDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
        lineHeight: 20,
    },
    planOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
        marginBottom: 16,
        position: 'relative',
        shadowColor: "#5A42E6",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    planOptionSelected: {
        borderColor: '#5A42E6',
        backgroundColor: '#FFFFFF',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 6,
        },
    },
    planOptionPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.95,
    },
    planDetails: {
        flex: 1,
    },
    planTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    planPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F172A',
        marginTop: 8,
    },
    // --- 按您的要求修改: 将周期文本的样式与价格对齐 ---
    planPeriod: {
        fontSize: 28,          // 字体大小与价格一致
        fontWeight: 'bold',   // 字体粗细与价格一致
        color: '#0F172A',      // 字体颜色与价格一致
    },
    selectorCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    selectorCircleSelected: {
        borderColor: '#5A42E6',
        backgroundColor: '#FFFFFF',
    },
    selectorInnerCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#5A42E6',
    },
    badgeContainer: {
        position: 'absolute',
        top: -14,
        right: 16,
        backgroundColor: '#0F172A',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 99,
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ctaButton: {
        marginTop: 24,
        borderRadius: 99,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.06,
        shadowRadius: 40,
        elevation: 8,
        overflow: 'hidden',
    },
    ctaGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaButtonPressed: {
        opacity: 0.85,
    },
    ctaButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    // --- 按您的要求修改: 页脚样式 ---
    footerText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 24,
    },
    // --- 新增: 为页脚中的可点击链接添加加粗样式 ---
    footerLink: {
        fontWeight: 'bold',
        color: '#808795', // 使用一个比普通文本稍深的颜色以示区别
    },
});