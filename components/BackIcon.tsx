import {Image, StyleSheet, TouchableOpacity} from "react-native";
import {router} from "expo-router";
import React from "react";

export default function BackIcon() {
    const BackIcon = require("../assets/images/back.png");
    return (
        <TouchableOpacity style={styles.backButton} onPress={()=>router.back()}>
            <Image source={BackIcon} style={styles.backButtonImage} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
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
})