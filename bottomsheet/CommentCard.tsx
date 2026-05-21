import { router } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { authUserAtom } from "@/storage/atom/auth.atom";
import { Colors } from "@/constants/theme";
import ReportButton from "./ReportButton";
import { profilePlaceholder } from "@/utils/profile-avatar-placeholder";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";


export const CommentCard: React.FC = ({onDelete,
comment
}:any) => {
  const user = useAtomValue(authUserAtom)
  const [liked, setLiked] = useState(comment?.liked || false);
  const [likeCount, setLikeCount] = useState(comment?.likeCount || 0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastTap = useRef<number>(0);
  const isProcessing = useRef(false);



  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };


  return (
      <View style={styles.card}>
        <Image source={profilePlaceholder('MALE')} style={styles.avatar} />
        <View style={styles.content}>
          <ThemedText style={styles.username}>{comment?.user?.username || '@realkevonporter'}</ThemedText>
          <ThemedText style={{fontSize:12}}
            >
            {comment?.text || 'This is just a test comment.'}
          </ThemedText>
          {/* {user?.id === comment?.user?.id ? (
            onDelete && (
              <TouchableOpacity onPress={()=>{}}>
                
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
            )
          ) : (
            <ReportButton target={{ type: 'USER', id: comment?.user?.id ?? "", username: comment?.user?.username }} />
          )} */}

        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={()=>{}} style={{ marginRight: 10 }}>
            <Animated.Text
              style={{
                color: liked ? Colors.light.tint : "gray",
                transform: [{ scale: scaleAnim }],
                fontSize: 12,
              }}
            >
              ♥ {likeCount}
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", padding: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  content: { flex: 1 },
  username: { fontWeight: "bold", fontSize:12 },
  actions: { flexDirection: "row", alignItems: "center" },
});
