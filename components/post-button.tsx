import { Colors } from "@/constants/theme";
import React, { ReactNode, useRef } from "react";
import {

Animated,
GestureResponderEvent,
Platform,
Pressable,
StyleProp,
StyleSheet,
ViewStyle,
Text,
View,
} from "react-native";

type Position = {
bottom?: number;
right?: number;
left?: number;
};

type Props = {
onPress?: (e: GestureResponderEvent) => void;
size?: number;
color?: string;
backgroundColor?: string;
position?: Position;
icon?: ReactNode;
style?: StyleProp<ViewStyle>;
accessibilityLabel?: string;
testID?: string;
};

/**
Floating Post Button
- Default: bottom-right, circular, animated press feedback
- Pass `icon` to render a custom icon, otherwise a "+" is shown
*/
const PostButton: React.FC<Props> = ({
onPress,
size = 56,
color = "#fff",
backgroundColor = Colors.dark.tint,
position = { bottom: 24, right: 24 },
icon,
style,
accessibilityLabel = "Create post",
testID = "post-button",
}) => {
const scale = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
    Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
    }).start();
};

const handlePressOut = () => {
    Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
    }).start();
};

const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        ...position,
    },
    style,
];

return (
    <Animated.View
        pointerEvents="box-none"
        style={[
            containerStyle,
            { transform: [{ scale }] },
        ]}
    >
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
            style={styles.pressable}
        >
            <View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}>
                {icon ? (
                    icon
                ) : (
                    <Text style={[styles.plus, { color, fontSize: Math.round(size * 0.6) }]}>+</Text>
                )}
            </View>
        </Pressable>
    </Animated.View>
);
};

const styles = StyleSheet.create({
container: {
    position: "absolute",
    // shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    // elevation for Android
    elevation: 8,
    zIndex: 1000,
},
pressable: {
    flex: 1,
    borderRadius: 999,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
},
inner: {
    alignItems: "center",
    justifyContent: "center"
},
plus: {
    lineHeight: undefined,
    includeFontPadding: false as any,
    textAlignVertical: "center",
    textAlign: "center",
    fontWeight: "600",
},
});

export default PostButton;