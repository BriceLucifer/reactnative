// 登陆界面
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { signInWithApple, signInWithGoogle } from "@/services/appwrite";
import {router} from "expo-router";

export default function Index() {
    const handleAppleLogin = async () => {
        // try { await signInWithApple(); } catch (e) { console.warn('Apple OAuth', e); }
        router.push("/screens/Permission");
    };
    const handleGoogleLogin = async () => {
        // try { await signInWithGoogle(); } catch (e) { console.warn('Google OAuth', e); }
        router.push("/screens/Permission");
    };

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
            <TouchableOpacity onPress={handleAppleLogin}>
              <LinearGradient
                colors={['#4A4849', '#292927']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.appleButton}
              >
                <Image 
                  source={require('../assets/images/apple.png')} 
                  style={styles.buttonIcon}
                />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Google 登录按钮 */}
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Image 
                source={require('../assets/images/google.png')} 
                style={styles.buttonIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
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
    fontSize: 32,              
    lineHeight: 48,          
    letterSpacing: -0.5,          
    textAlign: 'center',       
    color: '#020F20',
    maxWidth: 400,
    fontWeight: 'bold', // 使用系统字体的粗体
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#020F20',
    fontSize: 18,
    fontWeight: '600',
  },
});
