// Appwrite OAuth2 Service - 重构简化版本
import { Client, Account } from 'react-native-appwrite';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const APPWRITE_PROJECT_ID = "689c404400138a4a5f2d";
const APPWRITE_PUBLIC_ENDPOINT = "https://api.freedomai.fun/v1";

// 使用Appwrite控制台作为回调页面（最简单可靠的方式）
const SUCCESS_REDIRECT = `${APPWRITE_PUBLIC_ENDPOINT.replace('/v1', '')}/console`;
const FAILURE_REDIRECT = `${APPWRITE_PUBLIC_ENDPOINT.replace('/v1', '')}/console`;

export const client = new Client()
    .setEndpoint(APPWRITE_PUBLIC_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);

// 检查用户登录状态
export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
};

// 简化的Google OAuth2登录
export const signInWithGoogle = async () => {
    try {
        console.log('🚀 Starting Google OAuth2...');
        
        // 使用Appwrite SDK生成正确的OAuth2 URL
        const oauthUrlObject = await account.createOAuth2Session(
            'google', 
            SUCCESS_REDIRECT, 
            FAILURE_REDIRECT
        );
        
        // 转换为字符串URL
        const oauthUrl = typeof oauthUrlObject === 'string' ? oauthUrlObject : oauthUrlObject.href || oauthUrlObject.toString();
        console.log('🌐 Generated OAuth URL:', oauthUrl);
        
        // 打开OAuth2页面
        const result = await WebBrowser.openBrowserAsync(oauthUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            showTitle: false,
        });
        
        console.log('📱 Browser result:', result);
        
        // 用户完成OAuth后，检查是否登录成功
        if (result.type === 'dismiss') {
            // 等待一下让OAuth完成
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 检查是否登录成功
            const user = await getCurrentUser();
            if (user) {
                console.log('✅ Login successful:', user.email);
                return { success: true, user };
            } else {
                console.log('❌ Login failed or cancelled');
                return { success: false, error: 'Login cancelled or failed' };
            }
        }
        
        return { success: false, error: 'Browser closed unexpectedly' };
        
    } catch (error) {
        console.error('💥 Google OAuth error:', error);
        return { success: false, error: error.message };
    }
};

// 简化的Apple OAuth2登录
export const signInWithApple = async () => {
    try {
        console.log('🍎 Starting Apple OAuth2...');
        
        const oauthUrlObject = await account.createOAuth2Session(
            'apple',
            SUCCESS_REDIRECT,
            FAILURE_REDIRECT
        );
        
        // 转换为字符串URL
        const oauthUrl = typeof oauthUrlObject === 'string' ? oauthUrlObject : oauthUrlObject.href || oauthUrlObject.toString();
        console.log('🌐 Generated OAuth URL:', oauthUrl);
        
        const result = await WebBrowser.openBrowserAsync(oauthUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            showTitle: false,
        });
        
        console.log('📱 Browser result:', result);
        
        if (result.type === 'dismiss') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const user = await getCurrentUser();
            if (user) {
                console.log('✅ Login successful:', user.email);
                return { success: true, user };
            } else {
                console.log('❌ Login failed or cancelled');
                return { success: false, error: 'Login cancelled or failed' };
            }
        }
        
        return { success: false, error: 'Browser closed unexpectedly' };
        
    } catch (error) {
        console.error('💥 Apple OAuth error:', error);
        return { success: false, error: error.message };
    }
};

// 登出
export const signOut = async () => {
    try {
        await account.deleteSession('current');
        console.log('✅ Logged out successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Logout error:', error);
        return { success: false, error: error.message };
    }
};

// 测试连接
export const testConnection = async () => {
    try {
        console.log('🔍 Testing Appwrite connection...');
        console.log('📍 Endpoint:', APPWRITE_PUBLIC_ENDPOINT);
        console.log('🔑 Project ID:', APPWRITE_PROJECT_ID);
        
        const user = await getCurrentUser();
        if (user) {
            console.log('✅ Already logged in:', user.email);
        } else {
            console.log('ℹ️ Not logged in');
        }
        return user;
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        return null;
    }
};