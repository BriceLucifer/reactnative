import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import BackIcon from "@/components/BackIcon";

export default function PasswordLockScreen() {
    const handleClose = () => {
        // 处理关闭逻辑
        console.log("Close")
    }

    return (
        <View style={styles.container}>
            {/* 导航栏：包含返回按钮和标题 */}
            <View style={styles.header}>
                <BackIcon />
                <Text style={styles.title}>Password Lock</Text>
            </View>
            {/* 锁的图片 */}
            <Image source={require('@/assets/images/passwordlock.png')} style={styles.lockImage} />
            {/* 关闭按钮 */}
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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
        alignItems: 'flex-start', // 修改这里使得内容从顶部开始排列
        width: '100%',
        marginTop: 20,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 21,
        fontWeight: '600',
        color: '#000',
        marginLeft: -40,
        marginTop: 45, // 新增：向下移动标题
    },
    lockImage: {
        width: 240,
        height: 240,
        marginTop: 110,
    },
    closeButton: {
        width: 380,
        height: 60,
        backgroundColor: '#f0f0f0',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
        marginTop: 80,
    },
    closeButtonText: {
        color: '#ff3b30',
        fontSize: 20,
        fontWeight: 'semibold',
    },
});