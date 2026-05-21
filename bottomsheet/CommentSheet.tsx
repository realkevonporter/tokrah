import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StyleSheet,
  Alert,
  useColorScheme,
  Text,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import { BottomSheetFooter, BottomSheetFooterContainer, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import Toast from "react-native-toast-message";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { CommentCard } from "./CommentCard";


const LIMIT = 20;

interface CommentSheetProps {
  postId: string;
  onClose?: () => void;  // optional callback for closing sheet
  onCancel?: () => void;  // optional callback for closing sheet
}

export const CommentSheet: React.FC<CommentSheetProps> = ({ postId, onClose, onCancel }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const size = Dimensions.get("screen");
  const colorScheme = useColorScheme();

    const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} style={[styles.footer]}>
        <ThemedView darkColor="#ffffff90" lightColor="#e1e1e1" style={styles.input}>
          <BottomSheetTextInput />
        </ThemedView>
      </BottomSheetFooter>
    ),
    []
  );

  return (
    
    <BottomSheetView style={styles.container}>
      <BottomSheetView style={{flex:1}}>

          <FlatList
          data={[1,2,3,4,5,6,7,8,9,10]}
          renderItem={(item)=><CommentCard />}
          />

        
        

        </BottomSheetView>

        <BottomSheetFooterContainer footerComponent={renderFooter} />
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    
    borderColor: "#333",
  },
  input:{
    height:40,
    borderRadius:20,
    paddingVertical:5,
    paddingHorizontal:20,
    justifyContent:'center'
  }
});
