import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image, // 引入 Image 用于显示 back.png
} from 'react-native';
import { router } from 'expo-router';
import CustomButton from "@/components/CustomButton";

const backIcon = require('../../assets/images/back.png');

const Discord = () => {
    const [discordId, setDiscordId] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleSave = () => {
        console.log('Save button clicked with Discord ID:', discordId);
        // 可在此添加保存逻辑，如 API 请求
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
            <Text style={styles.title}>Discord Account Linking</Text>

            {/* 副标题 */}
            <Text style={styles.subtitle}>
                Connect your Discord account to use Discord to chat and receive notifications.
            </Text>

            {/* Discord ID 输入框 */}
            <TextInput
                style={styles.input}
                placeholder="Enter Discord ID"
                value={discordId}
                onChangeText={setDiscordId}
                keyboardType="default"
            />

            {/* 操作提示文字 */}
            <Text style={styles.instructions}>
                Please enter your Discord ID. Right-click on your Discord avatar and select &#34;Copy ID&#34; to get it.
            </Text>
            <Text style={styles.instructions}>
                Tip: You need to turn on developer mode in the Discord settings.
            </Text>

            {/* 保存按钮 */}
            <CustomButton onPress={handleSave} text={"Save"} />

            {/* “如何连接”提示按钮 */}
            <TouchableOpacity onPress={toggleModal} style={styles.connectButton}>
                <Text style={styles.connectButtonText}>How to connect</Text>
            </TouchableOpacity>

            {/* 模态框：展示连接步骤 */}
            <Modal visible={showModal} animationType="slide" transparent={false}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>How to connect</Text>
                    <Text style={styles.modalContent}>
                        To connect your Discord account, follow these steps:
                        {'\n'}1. Open Discord and go to User Settings.
                        {'\n'}2. Enable Developer Mode.
                        {'\n'}3. Right-click on your avatar and select &#34;Copy ID&#34;.
                        {'\n'}4. Paste the copied ID into the input field above.
                        {'\n'}5. Click the Save button to complete the connection.
                    </Text>
                    <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default Discord;

// 样式表（含详细注释）
const styles = StyleSheet.create({
    // 整体容器：占据全屏，白色背景，内边距
    container: {
        flex: 1, // 占据父容器全部可用空间
        padding: 20, // 内边距 20px
        backgroundColor: '#fff', // 白色背景
    },

    // 返回按钮容器样式
    backButton: {
        marginTop: 10, // 距离顶部 10px
        marginLeft: 5, // 可选：微调左侧位置
        width: 30, // 设置宽度，便于点击
        height: 30, // 设置高度
        justifyContent: 'center', // 垂直居中（如果用 Flex 布局）
        alignItems: 'center', // 水平居中
    },

    // 返回按钮中的图片样式
    backButtonImage: {
        width: 28, // 图标宽度
        height: 28, // 图标高度
        resizeMode: 'contain', // 保持宽高比缩放以适应
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: 70,
    },

    // 页面主标题样式
    title: {
        fontSize: 24, // 字号 20px
        fontWeight: 'bold', // 加粗
        marginTop: 60, // 距离上一个元素 60px
        textAlign: 'center', // 文字居中
        color: '#020F20'
    },

    // 副标题样式
    subtitle: {
        fontSize: 15, // 字号 14px
        marginTop: 16, // 距离标题 16px
        textAlign: 'center', // 文字居中
        color: '#9A9FA6', // 灰色文字，提升可读性
    },

    // 输入框样式
    input: {
        height: 60, // 高度 40px
        borderColor: '#ccc', // 边框颜色浅灰
        borderWidth: 1, // 边框宽度 1px
        borderRadius: 12, // 圆角 5px
        marginVertical: 22, // 上下外边距 20px
        paddingHorizontal: 18, // 左右内边距 10px
        backgroundColor: '#FFFFFF', // 浅灰背景，提升视觉层次
        fontSize: 16,
        color: '#9A9FA6'
    },

    // 保存按钮样式
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

    // 保存按钮文字样式
    saveButtonText: {
        color: '#fff', // 白色文字
        fontSize: 18,
        fontWeight: '600',
    },

    // 操作说明文字样式
    instructions: {
        fontSize: 16, // 字号 16px
        marginBottom: 8, // 下方外边距 8px
        color: '#9A9FA6', // 深灰色文字
        lineHeight: 20, // 行高 20px，提升可读性
    },

    // “如何连接”按钮容器
    connectButton: {
        alignItems: 'center', // 内容居中对齐
        marginTop: 20, // 距离上一个元素 20px
    },

    // “如何连接”按钮文字样式
    connectButtonText: {
        color: '#999999', // 浅灰色文字
        textDecorationLine: 'underline', // 下划线，表示可点击提示
    },

    // 模态框整体容器
    modalContainer: {
        flex: 1, // 占满整个屏幕
        justifyContent: 'center', // 垂直居中
        alignItems: 'center', // 水平居中
        backgroundColor: '#fff', // 白色背景
        padding: 40, // 内边距 40px
    },

    // 模态框标题
    modalTitle: {
        fontSize: 20, // 字号 20px
        fontWeight: 'bold', // 加粗
        marginBottom: 40, // 下方外边距 40px
    },

    // 模态框内容文字
    modalContent: {
        fontSize: 16, // 字号 16px
        marginBottom: 20, // 下方外边距 20px
        textAlign: 'center', // 居中对齐
        lineHeight: 24, // 行高 24px
        color: '#9A9FA6', // 深色文字
    },

    // 模态框关闭按钮
    closeButton: {
        backgroundColor: '#007bff', // 蓝色背景
        padding: 15, // 内边距 15px
        borderRadius: 5, // 圆角 5px
        marginTop: 20, // 上外边距 20px
        minWidth: 100, // 最小宽度，避免按钮太窄
        alignItems: 'center', // 文字水平居中
    },

    // 关闭按钮文字
    closeButtonText: {
        color: '#fff', // 白色文字
        fontSize: 16, // 字号 16px
        fontWeight: '600', // 半粗体
    },
});