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

// A single, reusable component for rendering the feature items.
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

// The main component for the "Get Pro" screen.
export default function GetShiroPro() {
    const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

    const handleStartPress = () => {
        console.log('Attempting to purchase the', selectedPlan, 'plan.');
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
                    <View>
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

                        {/* Annual Plan Option */}
                        <Pressable
                            style={[
                                styles.planOption,
                                selectedPlan === 'annual' && styles.planOptionSelected,
                            ]}
                            onPress={() => setSelectedPlan('annual')}
                        >
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>Save 20% off</Text>
                            </View>
                            <View style={styles.planDetails}>
                                <Text style={styles.planTitle}>Annual</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.planPrice}>$ 95</Text>
                                    <Text style={styles.planPeriod}> / year</Text>
                                </View>
                            </View>
                            <View style={[styles.selectorCircle, selectedPlan === 'annual' && styles.selectorCircleSelected]}>
                                {selectedPlan === 'annual' && <View style={styles.selectorInnerCircle} />}
                            </View>
                        </Pressable>

                        {/* Monthly Plan Option */}
                        <Pressable
                            style={[
                                styles.planOption,
                                selectedPlan === 'monthly' && styles.planOptionSelected,
                            ]}
                            onPress={() => setSelectedPlan('monthly')}
                        >
                            <View style={styles.planDetails}>
                                <Text style={styles.planTitle}>Monthly</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.planPrice}>$ 9.9</Text>
                                    <Text style={styles.planPeriod}> / month</Text>
                                </View>
                            </View>
                            <View style={[styles.selectorCircle, selectedPlan === 'monthly' && styles.selectorCircleSelected]}>
                                {selectedPlan === 'monthly' && <View style={styles.selectorInnerCircle} />}
                            </View>
                        </Pressable>
                    </View>

                    {/* --- NEW: This flexible spacer pushes the button and footer to the bottom --- */}
                    <View style={styles.spacer} />

                    <View>
                        <Pressable
                            style={({ pressed }) => [
                                styles.ctaButton,
                                pressed && styles.ctaButtonPressed
                            ]}
                            onPress={handleStartPress}
                        >
                            <LinearGradient
                                colors={['#383838', '#1E1E1E']}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={styles.ctaGradient}
                            >
                                <Text style={styles.ctaButtonText}>Start</Text>
                            </LinearGradient>
                        </Pressable>

                        <Text style={styles.footerText}>
                            Terms of Service · Privacy Policy
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// StyleSheet for all the components on this screen.
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
        tintColor: '#000000',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        flexGrow: 1, // MODIFIED: Allows the container to grow and fill the screen
        flexDirection: 'column', // MODIFIED: Ensure children are laid out vertically
        justifyContent: 'space-between', // MODIFIED: Pushes content apart
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 40,
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
        tintColor: '#000000',
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
        borderColor: '#F3F4F6',
        marginBottom: 16,
        position: 'relative',
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    planOptionSelected: {
        borderColor: '#0F172A',
        shadowColor: '#020F20',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
    },
    planDetails: {
        flex: 1,
        gap: 4,
    },
    planTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    planPrice: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    planPeriod: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    selectorCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    selectorCircleSelected: {
        borderColor: '#0F172A',
    },
    selectorInnerCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#0F172A',
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
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // NEW: Flexible spacer view
    spacer: {
        flex: 1,
    },
    ctaButton: {
        marginTop: 24, // A small top margin to ensure space from content above
        borderRadius: 99,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        overflow: 'hidden',
    },
    ctaGradient: {
        paddingVertical: 20,
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
    footerText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 13,
        marginTop: 24,
    },
});