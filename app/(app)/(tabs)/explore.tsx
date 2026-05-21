import { getUsers, updateFilter } from "@/api/card";
import MatchOverlay from "@/app/matchoverlay";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Header from "@/components/ui/header";
import Images from "@/constants/images";
import { Colors } from "@/constants/theme";
import Deck from "@/deck/deck";
import { authUserAtom } from "@/storage/atom/auth.atom";

import { authLocationAtom } from "@/storage/atom/location.atom";
import { matchIdAtom, matchUserAtom } from "@/storage/atom/match.atom";
import { Card } from "@/types/card.type";
import { calculateAge } from "@/utils/birthday-to-age.util";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {

  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;


export default function Explore() {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const theme = useColorScheme()
  const { top, bottom } = useSafeAreaInsets()

  const [matchedUser, setMatchedUser] = useAtom(matchUserAtom);
  const authUser = useAtomValue(authUserAtom);
  const matchId = useAtomValue(matchIdAtom);



  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <Header />
      <View style={styles.stack}>
        <Deck />
      </View>
      <MatchOverlay
        visible={!!matchedUser}
        matchedUser={matchedUser}
        currentUser={authUser}
        onClose={() => setMatchedUser(null)}
        onMessage={() => {
          setMatchedUser(null);

          router.push(`./matches/${matchId}`);
        }}
      />
    </ThemedView>
  );
}

const CARD_WIDTH = SCREEN_WIDTH - 20;
const CARD_HEIGHT = SCREEN_HEIGHT / SCREEN_WIDTH * CARD_WIDTH * 0.75;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: "transparent",

  },
  stack: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    bottom: 20,
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: "#fff",
    boxShadow: "0 5px 5px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    padding: 12,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  bio: {
    marginTop: 6,
    color: "#666",
  },
  likeLabel: {
    position: "absolute",
    top: 40,
    left: 20,
    transform: [{ rotate: "-20deg" }],
    borderWidth: 2,
    borderColor: "#21ce99",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(33,206,153,0.08)",
  },
  nopeLabel: {
    position: "absolute",
    top: 40,
    right: 20,
    transform: [{ rotate: "20deg" }],
    borderWidth: 2,
    borderColor: "#ff4d6d",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255,77,109,0.08)",
  },
  labelText: {
    fontSize: 18,
    fontWeight: "800",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    bottom: 120,
    right: 20,
    position: "absolute",
  },
  actionButton: {
    width: 70,
    height: 70,
    marginHorizontal: 10,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  noMoreCards: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  noMoreText: {
    fontSize: 22,
  },
});