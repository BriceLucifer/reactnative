import React from 'react';
import { View, StyleSheet, TextInput, Text } from 'react-native';
import BackIcon from "@/components/BackIcon";
import CustomButton from "@/components/CustomButton";

export default function FeedbackScreen() {
    return (
        <View style={styles.container}>
            {/* 顶部返回按钮 */}
            <View >
                <BackIcon />
            </View>

            {/* 中间内容区域：包含标题 */}
            <View style={styles.centerContent}>
                <Text style={styles.mainTitle}>Feedback</Text>
            </View>

            {/* 输入框 */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="I want"
                    multiline
                    numberOfLines={4}
                />
            </View>

            {/* 发送按钮 */}
            <CustomButton onPress={() => console.log("send")} text="Save" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 9,
        marginBottom: 24, // 给下面留点空间
    },
    mainTitle: {
        fontSize: 21,
        fontWeight: "bold",
        color: '#000',
        marginBottom: 2
    },
    inputContainer: {
        width: '100%',
        height: "50%"
    },
    textInput: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 20,
        fontSize: 16,
        width: '100%',
        height: '55%', // 建议固定高度或用 flex
        padding: 14,
        textAlignVertical: 'top', // 让多行文本从顶部开始
    },
});