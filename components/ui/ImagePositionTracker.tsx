import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  total: number;
  current: number;
  style?: ViewStyle;
};

const AnimatedBar = ({ active }: { active: boolean }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active ? 1 : 0.3, { duration: 150 }),
      transform: [
        {
          scaleX: withTiming(active ? 1 : 0.95, { duration: 150 }),
        },
      ],
    };
  });

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const ImagePositionTracker: React.FC<Props> = ({
  total,
  current,
  style,
}) => {
  if (!total || total <= 1) return null;

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, index) => (
        <AnimatedBar key={index} active={index === current} />
      ))}
    </View>
  );
};

export default ImagePositionTracker;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});