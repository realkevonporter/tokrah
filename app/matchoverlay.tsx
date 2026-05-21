import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { profilePlaceholder } from '@/utils/profile-avatar-placeholder';

const { width, height } = Dimensions.get('window');

type MatchOverlayProps = {
  visible: boolean;
  currentUser?: any;
  matchedUser?: any;
  onClose: () => void;
  onMessage?: () => void;
};

export default function MatchOverlay({
  visible,
  currentUser,
  matchedUser,
  onClose,
  onMessage,
}: MatchOverlayProps) {
  React.useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    }
  }, [visible]);

  if (!visible || !matchedUser) return null;

  const currentUserImage =
    currentUser?.media?.[0]?.url;

  const matchedUserImage =
    matchedUser?.media?.[0]?.url;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}
      style={styles.overlay}
    >
      <BlurView
        intensity={70}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        entering={ZoomIn.springify()}
        exiting={ZoomOut.duration(200)}
        style={styles.content}
      >
        <Animated.Text
          entering={SlideInDown.springify()}
          exiting={SlideOutDown}
          style={styles.title}
        >
          It’s a Match!
        </Animated.Text>

        <Text style={styles.subtitle}>
          You and {matchedUser.username} liked each other.
        </Text>

        <View style={styles.avatarContainer}>
          <Animated.View
            entering={ZoomIn.delay(150).springify()}
            style={[
              styles.avatarWrapper,
              {
                transform: [
                  { rotate: '-8deg' },
                ],
              },
            ]}
          >
            <Image
              source={
                currentUserImage
                  ? currentUserImage
                  : profilePlaceholder(matchedUser.gender)
              }
              contentFit="cover"
              transition={300}
              style={styles.avatar}
            />
          </Animated.View>

          <Animated.View
            entering={ZoomIn.delay(250).springify()}
            style={[
              styles.avatarWrapper,
              {
                marginLeft: -40,
                transform: [
                  { rotate: '8deg' },
                ],
              },
            ]}
          >
            <Image
              source={
                matchedUserImage
                  ? matchedUserImage
                  : profilePlaceholder(matchedUser.gender)
              }
              contentFit="cover"
              transition={300}
              style={styles.avatar}
            />
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.keepSwipingButton}
            onPress={onClose}
          >
            <Text style={styles.keepSwipingText}>
              Keep Swiping
            </Text>
          </Pressable>

          <Pressable
            style={styles.messageButton}
            onPress={onMessage}
          >
            <MaterialCommunityIcons
              name="message-text"
              size={22}
              color="#fff"
            />

            <Text style={styles.messageText}>
              Send Message
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 9999,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    width: width * 0.88,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    color: '#d1d1d1',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },

  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },

  avatarWrapper: {
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },

  avatar: {
    width: 170,
    height: 170,
    backgroundColor: '#1a1a1a',
  },

  actions: {
    width: '100%',
    gap: 16,
  },

  keepSwipingButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  keepSwipingText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  messageButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    backgroundColor: '#ff2d55',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  messageText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});