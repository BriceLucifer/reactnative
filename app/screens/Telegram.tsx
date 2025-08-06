import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import CustomButton from "@/components/CustomButton";

const backIcon = require('../../assets/images/back.png');
const closeIcon = require('../../assets/images/backx.png');

const { height: screenHeight } = Dimensions.get('window');

const Telegram = () => {
    const [discordId, setDiscordId] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleSave = () => {
        console.log('Save button clicked with Discord ID:', discordId);
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    return (
        <View style={styles.container}>
            {/* 返回按钮 */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Image source={backIcon} style={styles.backButtonImage} />
            </TouchableOpacity>

            {/* 页面标题 */}
            <Text style={styles.title}>Telegram Account Linking</Text>

            {/* 副标题 */}
            <Text style={styles.subtitle}>
                Link your Telegram account to Shiro so you can easily send text, images, and voice messages directly to Shiro for centralized storage and AI-powered feedback.
            </Text>

            {/* 输入框等 */}
            <TextInput
                style={styles.input}
                placeholder="Enter Telegram mobile number"
                value={discordId}
                onChangeText={setDiscordId}
                keyboardType="default"
            />

            <Text style={styles.instructions}>
                Please enter your Telegram registered mobile phone number, including the international dialing code, e.g. +1 13812345678
            </Text>

            <CustomButton onPress={handleSave} text={"Save"} />

            <TouchableOpacity onPress={toggleModal} style={styles.connectButton}>
                <Text style={styles.connectButtonText}>How to connect</Text>
            </TouchableOpacity>

            {/* 模态框 */}
            <Modal
                visible={showModal}
                animationType="slide" // 滑动动画
                transparent={true}
                // 可选：添加关闭回调监听，进一步控制动画
                onRequestClose={toggleModal} // Android 返回键支持
            >
                <TouchableOpacity
                    style={styles.modalBackground}
                    activeOpacity={1} // 点击背景区域时，不透明度不变
                    onPress={toggleModal}
                >
                    {/* ✅ 使用内联 style 设置动态高度 */}
                    <View style={[styles.modalContainer, { height: screenHeight * 0.65 }]}>
                        <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                            <Image source={closeIcon} style={styles.closeButtonImage} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>How to connect</Text>
                        <Text style={styles.modalContent}>
                            1. Enter your Telegram phone number above.
                            {'\n'}👉 Make sure to include your country code (for example: +1 4151234567).
                            {'\n\n'}2. Tap Save.
                            {'\n\n'}3. Open Telegram and search for @ShiroAI_Bot, or click here.
                            {'\n\n'}4. Start a conversation with ShiroAI_Bot and send your first message – text, photo, or voice.
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default Telegram;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        marginTop: 10,
        marginLeft: 5,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonImage: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 60,
        textAlign: 'center',
        color: '#020F20'
    },
    subtitle: {
        fontSize: 15,
        marginTop: 16,
        textAlign: 'center',
        color: '#9A9FA6',
    },
    input: {
        height: 60,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 12,
        marginVertical: 22,
        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        color: '#9A9FA6'
    },
    saveButton: {
        backgroundColor: '#000000',
        borderRadius: 30,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 14,
        marginBottom: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    instructions: {
        fontSize: 16,
        marginBottom: 8,
        color: '#9A9FA6',
        lineHeight: 20,
    },
    connectButton: {
        alignItems: 'center',
        marginTop: 20,
    },
    connectButtonText: {
        color: '#999999',
        textDecorationLine: 'underline',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        // 高度由外部动态注入，这里不设固定 height
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
    closeButtonImage: {
        width: 22,
        height: 22,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalContent: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'left',
        lineHeight: 24,
        color: '#020F20',
    },
});