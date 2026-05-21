import { getMatches } from "@/api/match";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import Header from "@/components/ui/header";
import { Match } from "@/types/match.type";
import { profilePlaceholder } from "@/utils/profile-avatar-placeholder";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getSocket } from "@/sockets";

export default function MatchesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [query, setQuery] = useState("");

  const theme = useColorScheme();
  const { top } = useSafeAreaInsets();

  /**
   * FETCH MATCHES
   */
  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await getMatches();

      const sorted = [...res.matches].sort((a: any, b: any) => {
        const ta = a.lastMessage?.createdAt
          ? Date.parse(a.lastMessage.createdAt)
          : 0;
        const tb = b.lastMessage?.createdAt
          ? Date.parse(b.lastMessage.createdAt)
          : 0;

        return tb - ta;
      });

      setMatches(sorted);
    } catch (err) {
      console.log("load matches error", err);
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * SOCKET REALTIME UPDATES
   */
  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewMessage = (message: any) => {
      setMatches(prev => {
        const updated = prev.map(match => {
          if (match.id !== message.matchId) return match;

          return {
            ...match,
            lastMessage: {
              id: message.id,
              text: message.text,
              createdAt: message.createdAt,
              senderId: message.senderId,
            },
            unreadCount: (match as any).unreadCount
              ? (match as any).unreadCount + 1
              : 1,
          } as Match;
        });

        return updated.sort((a: Match, b: Match) => {
          const ta = a.lastMessage?.createdAt
            ? Date.parse(a.lastMessage.createdAt)
            : 0;

          const tb = b.lastMessage?.createdAt
            ? Date.parse(b.lastMessage.createdAt)
            : 0;

          return tb - ta;
        });
      });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, []);

  /**
   * FILTERED SEARCH
   */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return matches;

    return matches.filter(m =>
      m.user.username.toLowerCase().includes(q)
    );
  }, [matches, query]);

  /**
   * OPEN CHAT
   */
  const handleOpen = useCallback((item: Match) => {
    setMatches(prev =>
      prev.map(m =>
        m.id === item.id
          ? { ...m, unreadCount: 0 }
          : m
      )
    );

    router.navigate({
      pathname: "/(app)/conversation",
      params: { id: item.id, avatar:item.user.medias[0]?.url, username: item.user.username, gender: item.user.gender },
    });
  }, []);

  /**
   * RENDER ITEM
   */
  const renderItem = useCallback(({ item }: { item: Match }) => {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleOpen(item)}
      >
        <Image
          source={
            item.user?.medias?.[0]?.url
              ? { uri: item.user.medias[0].url }
              : profilePlaceholder(item.user.gender)
          }
          style={styles.avatar}
          contentFit="cover"
        />

        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {item.user.username}
          </ThemedText>

          <ThemedText style={styles.last} numberOfLines={1}>
            {item.lastMessage?.text ||
              item.lastMessage?.text ||
              "No messages yet"}
          </ThemedText>
        </View>

        {(item as any).unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {(item as any).unreadCount}
            </Text>
          </View>
        )}

        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
    );
  }, [handleOpen]);

  /**
   * LOADING STATE
   */
  if (loading && matches.length === 0) {
    return (
      <ThemedView style={{}}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>
          Loading matches…
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <Header />

      {/* SEARCH */}
      <ThemedView lightColor="#f7f7f7" darkColor="#000" style={[styles.searchWrap, {borderWidth:.5, borderColor:theme === 'light' ? '#e1e1e1' : '#222'}]}>
        <ThemedTextInput
        
          placeholder="Search matches"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
      </ThemedView>

<ThemedView style={{flex:1}} lightColor="#f7f7f7" darkColor="#000">
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
          />
        }
        ItemSeparatorComponent={<ThemedView lightColor="#00000015" style={{width:'100%', height:1}} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#374151",
  },
  searchWrap: {
    marginTop:20,
    marginBottom:5,
    marginHorizontal: 10,
    paddingVertical: 8,
    borderRadius:10,
  },
  search: {
    overflow: "hidden",
    paddingHorizontal: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    //backgroundColor: "#fff",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e5e7eb",
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  last: {
    marginTop: 2,
    color: "#6b7280",
  },
  chev: {
    fontSize: 24,
    //color: "#d1d5db",
    marginLeft: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#f3f4f6",
    marginLeft: 80,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  emptySubtitle: {
    marginTop: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  cta: {
    marginTop: 16,
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "600",
  },
  badge: {
  backgroundColor: "#ef4444",
  minWidth: 20,
  height: 20,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 5,
  marginRight: 8,
},

badgeText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "600",
},
});