import React, { useEffect } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {router} from "expo-router";

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.80;

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ visible, onClose }: ProfileDrawerProps) {
  const translateX = useSharedValue(DRAWER_WIDTH);

// Discord 页面跳转
const handleDiscord = () => {
  router.push('/screens/Discord');
}

// Telegram 页面跳转
const handleTelegram = () => {
  router.push("/screens/Telegram")
}

// Password Lock page 跳转
const handlePassword = () => {
  router.push("/screens/PasswordLock")
}

// Feedback 页面跳转
const handleFeedBack = () => {
  router.push("/screens/Feedback")
}

  useEffect(() => {
    translateX.value = visible ? withSpring(0) : withTiming(DRAWER_WIDTH);
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(0, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value > DRAWER_WIDTH * 0.3) {
        translateX.value = withTiming(DRAWER_WIDTH, {}, () => {
          runOnJS(onClose)();
        });
      } else {
        translateX.value = withSpring(0); // 回弹
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    shadowOpacity: interpolate(
      translateX.value,
      [0, DRAWER_WIDTH],
      [0.2, 0],
    ),
  }));

  return (
    <>
      {/* 遮罩 */}
      {visible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            translateX.value = withTiming(DRAWER_WIDTH, {}, () => {
              runOnJS(onClose)();
            });
          }}
        />
      )}

      {/* 抽屉滑入部分 */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.drawer, animatedStyle]}>
          {/* 头像 + 名字 */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <Text style={styles.name}>Mike</Text>
          </View>

          {/* 使用情况 */}
          <View style={styles.usageBox}>
            <Text style={styles.usageTitle}>Free Plan Usage</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '20%' }]} />
            </View>
            <Text style={styles.usageHint}>
                You&#39;ve used 8 AI conversations this month. Upgrade for unlimited access.
            </Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>

          {/* 菜单 */}
          <View style={styles.menuList}>
            <MenuItem icon={require('../assets/images/discord.png')} label="Discord" onPress={handleDiscord} />
            <MenuItem icon={require('../assets/images/telegram.png')} label="Telegram" onPress={handleTelegram} />
            <MenuItem icon={require('../assets/images/lock.png')} label="Password Lock" onPress={handlePassword}/>
            <MenuItem icon={require('../assets/images/feedback.png')} label="Feedback" onPress={handleFeedBack}/>
            <MenuItem icon={require('../assets/images/logout.png')} label="Sign out" />

          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

function MenuItem({ icon, label, onPress}: { icon: any; label: string, onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Image source={icon} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: -2, height: 0 },
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 36,
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
    top: 30
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#444',
  },
  name: {
    marginTop: 50,
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  usageBox: {
    backgroundColor: '#020F20',
    borderRadius: 16,
    padding: 18,
    marginBottom: 30,
    alignSelf: 'stretch',
    width: '100%',
  },
  usageTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 12
  },
  usageText: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    borderRadius: 3,
    backgroundColor: '#333D4B',
    overflow: 'hidden',
    marginBottom: 3,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F5F5F5',
  },
  upgradeButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    borderRadius: 50,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
  },
  upgradeText: {
    fontWeight: '600',
    color: '#000',
  },
  menuList: {
    gap: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111',
  },
  usageHint: {
    color: 'rgba(245, 245, 245, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 12,
    width: "auto",
    alignSelf: 'stretch',
    marginBottom: 6,
    marginTop: 8,
  },
});
