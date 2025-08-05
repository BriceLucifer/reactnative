// permission 界面

import { router } from 'expo-router';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BackIcon from "@/components/BackIcon";
import CustomButton from "@/components/CustomButton";

export default function Permission(){
    const handleBack = () => {
        router.back();
    };

    const handleContinue = () => {
        router.push('/screens/Note');
    };

    return (
        <ImageBackground 
            source={require('../../assets/images/background.png')}  
            style={styles.backgroundImage} 
            resizeMode="cover"
        >

            <View style={styles.container}>
                {/* 顶部区域：返回按钮和白色基线 */}
                    <BackIcon></BackIcon>

                {/* 标题区域 - 居中 */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Enable permissions</Text>
                    <Text style={styles.subtitle}>Shiro uses these to gently support you:</Text>
                </View>

                {/* 权限卡片区域 */}
                <View style={styles.permissionsContainer}>
                    {/* 通知权限 */}
                    <View style={styles.permissionCard}>
                        <Image 
                            source={require('../../assets/images/notification.png')} 
                            style={styles.iconImage}
                        />
                        <View style={styles.permissionContent}>
                            <Text style={styles.permissionTitle}>Notifications</Text>
                            <Text style={styles.permissionDescription}>To remind and encourage you to write.</Text>
                        </View>
                    </View>

                    {/* 日历权限 */}
                    <View style={styles.permissionCard}>
                            <Image 
                                source={require('../../assets/images/calendar.png')} 
                                style={styles.iconImage}
                            />
                        <View style={styles.permissionContent}>
                            <Text style={styles.permissionTitle}>Calendar</Text>
                            <Text style={styles.permissionDescription}>To suggest good moments for reflection.</Text>
                        </View>
                    </View>

                    {/* 位置权限 */}
                    <View style={styles.permissionCard}>
                            <Image 
                                source={require('../../assets/images/location.png')} 
                                style={styles.iconImage}
                            />
                        <View style={styles.permissionContent}>
                            <Text style={styles.permissionTitle}>Location</Text>
                            <Text style={styles.permissionDescription}>To offer thoughtful prompts wherever {'\n'}you are.</Text>
                        </View>
                    </View>
                </View>

                <CustomButton onPress={handleContinue} text={'Continue'} />
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        width: '100%',
        height: '100%',
        transform: [{ scaleY: -1 }], // 背景上下翻转
    },
    container: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 30,
        paddingBottom: 30,
        transform: [{ scaleY: -1 }], // 内容再翻转回来
    },

    // title
    titleContainer: {
        alignItems: 'center', // 标题居中
        marginBottom: 10,
        marginTop: 80,
    },
    title: {
        color: '#020F20',
        fontSize: 36,
        fontWeight: '600',
        lineHeight: 50,
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        color: '#8E8E93',
        fontSize: 18,
        lineHeight: 36,
        textAlign: 'justify',
        alignSelf: 'flex-start',
        width: '100%',
    },
    permissionsContainer: {
        flex: 1,
        marginBottom: 40,
    },
    permissionCard: {
        flexDirection: 'row',
        padding: 18,
        alignItems: 'flex-start',
        gap: 12,
        alignSelf: 'stretch',
        backgroundColor: '#FFF',
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E7EAED',
        // 添加阴影效果
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.07,
        shadowRadius: 20,
        elevation: 10, // Android 阴影
    },
    iconImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginTop: 4,
    },
    permissionContent: {
        flex: 1,
        justifyContent: 'center', // 添加这行，让文字内容垂直居中
    },
    permissionTitle: {
        color: '#020F20',
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 24,
        marginBottom: 4,
    },
    permissionDescription: {
        color: '#999999',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    continueButton: {
        backgroundColor: '#333231',
        borderRadius: 27,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600'
    },
});