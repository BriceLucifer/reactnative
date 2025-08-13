// Services/appwrite.ts
import { Client, Account } from 'react-native-appwrite';
import * as Linking from 'expo-linking';

export const APPWRITE_ENDPOINT = 'https://shiro.freedomai.fun/v1';
export const APPWRITE_PROJECT  = '688a534b000dacc7f1c8';

// Expo 开发期会返回 exp://...；打包后会是 shiro://auth-callback
export const OAUTH_CB = Linking.createURL('auth-callback');

export const client  = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT);
export const account = new Account(client);

// @ts-ignore
export const signInWithGoogle = () => account.createOAuth2Session('google', OAUTH_CB, OAUTH_CB);
// @ts-ignore
export const signInWithApple  = () => account.createOAuth2Session('apple',  OAUTH_CB, OAUTH_CB);

export const signOut = async () => { try { await account.deleteSession('current'); } catch {} };
