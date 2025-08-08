import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    Dimensions,
    Pressable,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import CustomButton from "@/components/CustomButton";
import PhoneInput from 'react-native-phone-number-input';

const backIcon = require('../../assets/images/back.png');
const closeIcon = require('../../assets/images/backx.png');

const PhoneInputComponent = PhoneInput as unknown as React.ComponentType<any>;
const { height: screenHeight } = Dimensions.get('window');

const Telegram = () => {
    const [showModal, setShowModal] = useState(false);
    const [value, setValue] = useState('');
    const [formattedValue, setFormattedValue] = useState('');

    const toggleModal = () => setShowModal(!showModal);

    const handleSave = () => {
        if (!formattedValue || formattedValue.length < 10 || !formattedValue.startsWith('+')) {
            Alert.alert("Invalid Number", "Please enter a valid international phone number.");
            return;
        }

        console.log('Phone number saved:', formattedValue);
        // 可发送至后端
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

            {/* 电话输入框 */}
            <PhoneInputComponent
                defaultValue={value}
                defaultCode="US"
                layout="first"
                onChangeText={(text: string) => setValue(text)}
                onChangeFormattedText={(text: string) => setFormattedValue(text)}
                withDarkTheme
                withShadow
                containerStyle={styles.phoneInputContainer}
                textContainerStyle={styles.phoneInputTextContainer}
                codeTextStyle={styles.codeTextStyle}
            />

            <Text style={styles.instructions}>
                Please enter your Telegram registered mobile phone number, including the international dialing code, e.g. +1 13812345678
            </Text>

            <CustomButton onPress={handleSave} text="Save" />

            {/* 说明按钮 */}
            <TouchableOpacity onPress={toggleModal} style={styles.connectButton}>
                <Text style={styles.connectButtonText}>How to connect</Text>
            </TouchableOpacity>

            {/* 弹窗 */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={toggleModal}
            >
                <Pressable style={styles.modalBackground} onPress={toggleModal}>
                    <View style={[styles.modalContainer, { height: screenHeight * 0.75 }]}>
                        <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                            <Image source={closeIcon} style={styles.closeButtonImage} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>How to connect</Text>
                        <Text style={styles.modalContent}>
                            1. Enter your Telegram phone number above.
                            {'\n'}👉 Make sure to include your country code (e.g. +1 4151234567).
                            {'\n\n'}2. Tap Save.
                            {'\n\n'}3. Open Telegram and search for @ShiroAI_Bot, or click here.
                            {'\n\n'}4. Start a conversation with ShiroAI_Bot and send your first message – text, photo, or voice.
                        </Text>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default Telegram;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        backgroundColor: '#fff',
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
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 30,
        textAlign: 'center',
        color: '#020F20',
    },
    subtitle: {
        fontSize: 15,
        marginTop: 16,
        textAlign: 'center',
        color: '#9A9FA6',
    },
    phoneInputContainer: {
        height: 60,
        borderRadius: 22,
        marginTop: 24,
        width: '100%',
        backgroundColor: '#f0f0f0',
    },
    phoneInputTextContainer: {
        borderRadius: 22,
        paddingHorizontal: 18,
        backgroundColor: '#fff',
    },
    codeTextStyle: {
        fontSize: 16,
        color: '#020F20',
    },
    instructions: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 20,
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
        textAlign: 'left',
        lineHeight: 24,
        color: '#020F20',
    },
});
