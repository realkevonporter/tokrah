import PostButton from "@/components/post-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Header from "@/components/ui/header";
import { getPosts } from "@/api/post";
import { profilePlaceholder } from "@/utils/profile-avatar-placeholder";
import { Post } from "@/types/post.type";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useFocusEffect } from "expo-router";

import React, {
  useCallback,
  useEffect,
  useState,
  memo,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useBottomSheet } from "@/bottomsheet/BottomSheetProvider";
import { Colors } from "@/constants/theme";
import { useAtomValue } from "jotai";
import { authUserAtom } from "@/storage/atom/auth.atom";

function FeedPost({
  item,
  onLike,
}: {
  item: Post;
  onLike: (id: string) => void;
}) {
  const authUser = useAtomValue(authUserAtom)
  const [avatarError, setAvatarError] = useState(false);
const { openSheet } = useBottomSheet();
  return (
    <ThemedView
      darkColor={Colors.dark.card.background}
      lightColor={Colors.light.card.background}
      style={styles.card}
    >
      <View style={styles.header}>
        <Image
        contentPosition="top center"
          placeholder={profilePlaceholder(item.author.gender)}
          placeholderContentFit="cover"
          contentFit="cover"
          transition={150}
          onError={() => setAvatarError(true)}
          source={
            avatarError || !item.author.medias?.[0]?.url
              ? profilePlaceholder(item.author.gender)
              : item.author.id ===  authUser?.id ? {uri: authUser.medias[0].url} : { uri: item.author.medias[0].url }
          }
          style={styles.avatar}
        />

        <View style={styles.headerText}>
          <ThemedText style={styles.author}>
            {item.author.username}
          </ThemedText>

          <ThemedText style={styles.time}>
            {new Date(item.createdAt).toLocaleString()}
          </ThemedText>
        </View>
      </View>

      {!!item.text && (
        <ThemedText style={styles.content}>
          {item.text}
        </ThemedText>
      )}

      {!!item.medias?.length && (
        <Image
          source={{ uri: item.medias[0].url }}
          contentFit="cover"
          transition={200}
          style={styles.postImage}
        />
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={() => onLike(item.id)}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText
            style={[
              styles.actionText,
              item.liked && styles.liked,
            ]}
          >
            {item.liked ? "♥" : "♡"} {item.likes || 0}
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}

          onPress={()=>{
            router.push({pathname:'/comment-sheet', params:{id:item.id}})
          }}
        >
          <ThemedText style={styles.actionText}>
            <MaterialCommunityIcons name="comment-outline" /> {item.comments || 0}
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText style={styles.actionText}>
            <MaterialCommunityIcons name="information-outline" />
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const MemoizedFeedPost = memo(FeedPost);

export default function FeedScreen() {
  const { top } = useSafeAreaInsets();

  const theme = useColorScheme();

  const [posts, setPosts] = useState<Post[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [hasMore, setHasMore] = useState(true);

  const [privacy, setPrivacy] = useState(false);

  const [cursor, setNextCursor] = useState("")

  const fetchFeed = useCallback(
    async (replace = false) => {
      try {
        const data = await getPosts("public", cursor);

        setPosts((prev) =>
          replace ? data.posts : [...prev, ...data.posts]
        );

        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore);
      } catch (error) {
        Alert.alert("Error", "Failed to load posts.");
      }
    },
    [cursor, privacy]
  );

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);

    await fetchFeed(true);

    setInitialLoading(false);
  }, [fetchFeed]);

  useEffect(()=>{
    loadInitial();
  },[])

const loadMore = useCallback(async () => {
  if (loadingMore || !hasMore || !cursor) return;

  setLoadingMore(true);
  await fetchFeed(false);
  setLoadingMore(false);
}, [loadingMore, hasMore, cursor, fetchFeed]);

const checkForNewPosts = useCallback(async () => {
  try {
    const data = await getPosts("public", ""); // empty cursor = first page

    setPosts(prev => {
      const existingIds = new Set(prev.map(p => p.id));

      const newOnes = data.posts.filter((p:Post) => !existingIds.has(p.id));

      if (newOnes.length === 0) return prev;

      return [...newOnes, ...prev];
    });
  } catch (err) {
    console.log("Failed to check new posts", err);
  }
}, []);


  useFocusEffect(
    useCallback(()=>{
      checkForNewPosts()
      return ()=>{

      }
    },[])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setNextCursor("")
    await fetchFeed(true);
    setRefreshing(false);
  }, [fetchFeed]);

  const toggleLike = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== id) return post;

        const currentLikes = post.likes ?? 0;

        return {
          ...post,
          liked: !post.liked,
          likes: post.liked
            ? currentLikes - 1
            : currentLikes + 1,
        };
      })
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Post>) => {
      return (
        <MemoizedFeedPost
          item={item}
          onLike={toggleLike}
        />
      );
    },
    [toggleLike]
  );

  if (initialLoading) {
    return (
      <ThemedView
        style={[
          styles.container,
          styles.center,
          { paddingTop: top },
        ]}
      >
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <View
      style={[styles.container, { paddingTop: top }]}
    >
      <Header />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />

      <PostButton
        icon={
          <MaterialCommunityIcons
            name="card"
            size={25}
          />
        }
        onPress={() => router.navigate("/post")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  list: {
    padding: 12,
    paddingBottom: 120,
  },

  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },

  headerText: {
    flex: 1,
  },

  author: {
    fontWeight: "600",
    fontSize: 15,
  },

  time: {
    color: "#666",
    fontSize: 12,
  },

  content: {
    fontSize: 14,
    marginBottom: 8,
  },

  postImage: {
    width: "100%",
    height: 260,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#e1e4e8",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  actionText: {
    fontSize: 14,
  },

  pressed: {
    opacity: 0.6,
  },

  liked: {
    color: "#e0245e",
    fontWeight: "700",
  },

  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});