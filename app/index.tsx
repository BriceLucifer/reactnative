// 登陆界面
import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
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
            {/* Apple 登录按钮 */}
            <TouchableOpacity style={styles.appleButton}>
              <Image 
                source={require('../assets/images/apple.png')} 
                style={styles.buttonIcon}
              />
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            {/* Google 登录按钮 */}
            <TouchableOpacity style={styles.googleButton}>
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
    paddingTop: 100,
    paddingBottom: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  headerTypography: {
    fontFamily: 'Gilroy-ExtraBold',
    fontWeight: '700',         
    fontSize: 32,              
    lineHeight: 40,          
    letterSpacing: 0,          
    textAlign: 'center',       
    color: '#020F20',
    maxWidth: 300,
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
    gap: 16,
    marginBottom: 40,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
    resizeMode: 'contain',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
  },
});
