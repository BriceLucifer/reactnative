import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {LinearGradient} from "expo-linear-gradient";

type Props = {
    onPress: () => void;
    text: string;
}

export default function CustomButton({onPress, text}: Props) {
    return (
        <TouchableOpacity onPress={onPress}>
            <LinearGradient
                colors={styles.colors}
                start={styles.start}
                end={styles.end}
                style={styles.ButtonContainer}
            >
                <Text style={styles.ButtonText}>{text}</Text>
            </LinearGradient>
        </TouchableOpacity>);
}

const styles = StyleSheet.create({
    colors:['#4A4849', '#292927'],
    start:{ x: 0, y: 0 },
    end:{ x: 0, y: 1 },
    // 按钮样式
    ButtonContainer: {
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

    // 按钮文字样式
    ButtonText: {
        color: '#fff', // 白色文字
        fontSize: 18,
        fontWeight: '600',
    },
})