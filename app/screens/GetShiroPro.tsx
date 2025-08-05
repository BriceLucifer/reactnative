import {Text} from "react-native";
import {router} from "expo-router";

export default function GetShiroPro() {
    // 返回逻辑
    const handleBack = () => {
        router.back();
    }

    return (
        <Text>Get Shiro Pro</Text>
    )
}