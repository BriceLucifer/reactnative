// 登陆界面
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { router } from "expo-router";
import { signInWithApple, signInWithGoogle, testConnection } from '../services/appwrite';
import { FontStyles } from '../constants/Fonts';

export default function Index() {
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    useEffect(() => {
        // Test connection when component mounts
        testConnection();
    }, []);

    const handleAppleLogin = async () => {
        if (isAppleLoading) return;
        
        setIsAppleLoading(true);
        try {
            const result = await signInWithApple();
            
            if (result.success) {
                // 登录成功，跳转到权限页面
                Alert.alert('登录成功', `欢迎，${result.user.email}!`, [
                    { text: '继续', onPress: () => router.push('/screens/Permission') }
                ]);
            } else {
                // 登录失败或取消
                if (result.error !== 'Login cancelled or failed') {
                    Alert.alert('登录失败', result.error || '请稍后重试');
                }
            }
        } catch (e) {
            console.error('Apple login error:', e);
            Alert.alert('登录失败', '登录过程中发生错误，请稍后重试');
        } finally {
            setIsAppleLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (isGoogleLoading) return;
        
        setIsGoogleLoading(true);
        try {
            const result = await signInWithGoogle();
            
            if (result.success) {
                // 登录成功，跳转到权限页面
                Alert.alert('登录成功', `欢迎，${result.user.email}!`, [
                    { text: '继续', onPress: () => router.push('/screens/Permission') }
                ]);
            } else {
                // 登录失败或取消
                if (result.error !== 'Login cancelled or failed') {
                    Alert.alert('登录失败', result.error || '请稍后重试');
                }
            }
        } catch (e) {
            console.error('Google login error:', e);
            Alert.alert('登录失败', '登录过程中发生错误，请稍后重试');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handlepermission = async () => {
        router.push('/screens/Permission');
    }

    return (
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* 标题区域 */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTypography}>Simply write, always remembered</Text>
          </View>

          {/* 装饰图形区域 */}
          <View style={styles.decorationContainer}>
            {/* 这里可以添加装饰性图形，暂时用占位符 */}
            <View style={styles.decorationPlaceholder} />
          </View>

          {/* 登录按钮区域 */}
          <View style={styles.buttonContainer}>
            {/* Apple 登录按钮 - 使用渐变 */}
            <TouchableOpacity onPress={ handlepermission } disabled={isAppleLoading || isGoogleLoading}>
              <LinearGradient
                colors={['#4A4849', '#292927']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.appleButton, (isAppleLoading || isGoogleLoading) && styles.disabledButton]}
              >
                {isAppleLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Image
                    source={require('../assets/images/apple.png')}
                    style={styles.buttonIcon}
                  />
                )}
                <Text style={styles.appleButtonText}>
                  {isAppleLoading ? 'Loading...' : 'Continue with Apple'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Google 登录按钮 */}
            <TouchableOpacity 
              style={[styles.googleButton, (isAppleLoading || isGoogleLoading) && styles.disabledButton]} 
              onPress={ handlepermission }
              disabled={isAppleLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#020F20" />
              ) : (
                <Image
                  source={require('../assets/images/google.png')}
                  style={styles.buttonIcon}
                />
              )}
              <Text style={styles.googleButtonText}>
                {isGoogleLoading ? 'Loading...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 90, // 保持原来的值
    paddingBottom: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 60, // 增加顶部边距，让标题往下移动
  },
  headerTypography: {
    ...FontStyles.title,
    letterSpacing: -0.5,
    textAlign: 'center',
    color: '#020F20',
    maxWidth: 400,
  },
  decorationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorationPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 100,
  },
  buttonContainer: {
    gap: 20,
    marginBottom: 40, // 从40增加到80，让按钮往上移动
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 30,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  googleButton: {
    backgroundColor: 'transparent', // 改为透明
    borderRadius: 30, // 保持和Apple按钮一致的圆角
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.98)', // 半透明白色边框
  },
  buttonIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
    resizeMode: 'contain',
  },
  appleButtonText: {
    ...FontStyles.buttonLarge,
    color: '#FFFFFF',
  },
  googleButtonText: {
    ...FontStyles.buttonLarge,
    color: '#020F20',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
