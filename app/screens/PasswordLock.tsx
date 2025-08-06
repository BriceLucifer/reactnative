import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function PasswordLock() {
    const handleClose = () => {
        console.log('Close');
        // 可以在这里添加关闭逻辑
    };

    return (
        <View style={styles.container}>
            {/* 导航栏：包含返回按钮和标题 */}
            <View style={styles.header}>
                {/* 内联返回按钮 */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Image
                        source={require('@/assets/images/back.png')}
                        style={styles.backButtonImage}
                    />
                </TouchableOpacity>

                {/* 标题 */}
                <Text style={styles.title}>Password Lock</Text>
            </View>

            {/* 锁的图片 */}
            <Image
                source={require('@/assets/images/passwordlock.png')}
                style={styles.lockImage}
            />

            {/* 关闭按钮 */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center', // 垂直居中对齐图标和标题
        width: '100%',
        marginTop: 50, // 整体导航栏下移一点
        marginBottom: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonImage: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    title: {
        flex: 1,
        marginLeft: 90,
        fontSize: 21,
        fontWeight: '600',
        color: '#000',
    },
    lockImage: {
        width: 240,
        height: 240,
        marginBottom: 40,
    },
    closeButton: {
        width: '90%',
        height: 60,
        backgroundColor: '#f0f0f0',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
    },
    closeButtonText: {
        color: '#ff3b30',
        fontSize: 20,
        fontWeight: '600',
    },
});