import ProfileDrawer from '@/components/ProfileDrawer';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Note() {
    const [isDrawerVisible, setDrawerVisible] = useState(false);

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}/${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')} ${currentDate
        .getHours()
        .toString()
        .padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

    const handleAddNote = () => {
        console.log('Add note pressed');
    };

    const handleSearch = () => {
        console.log('Chat pressed');
    };

    const handleProfile = () => {
        setDrawerVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* 顶部导航栏 */}
            <View style={styles.header}>
                <Text style={styles.appTitle}>Shiro</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
                        <Image
                            source={require('../../assets/images/chat.png')}
                            style={styles.iconImage}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleProfile}>
                        <Image
                            source={require('../../assets/images/profile.png')}
                            style={styles.iconImage}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 主要内容区域 */}
            <View style={styles.mainContent}>
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateTitle}>
                        You haven&#39;t added anything yet
                    </Text>
                    <Text style={styles.emptyStateSubtitle}>
                        Click on the plus, to add notes
                    </Text>

                    {/* 日期显示 */}
                    <Text style={styles.dateText}>{formattedDate}</Text>

                    {/* 加号按钮 */}
                    <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 抽屉组件 */}
            <ProfileDrawer visible={isDrawerVisible} onClose={() => setDrawerVisible(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    appTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#020F20',
        fontFamily: 'Gilroy-Bold',
        left: 14,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    iconImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateContainer: {
        alignItems: 'center',
        width: '100%',
    },
    emptyStateTitle: {
        color: '#020F20',
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: 'Gilroy-SemiBold',
    },
    emptyStateSubtitle: {
        color: '#8E8E93',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: 'Gilroy-Regular',
    },
    dateText: {
        color: '#C7C7CC',
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 30,
        fontFamily: 'Gilroy-Regular',
    },
    addButton: {
        width: 95,
        height: 56,
        backgroundColor: '#333231',
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: '#020F20',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: '500',
        lineHeight: 28,
    },
});
