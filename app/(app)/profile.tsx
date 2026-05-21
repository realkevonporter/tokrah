import React, { useState, useRef } from "react";
import {

  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";

type Profile = {
  id: string;
  name: string;
  age: number;
  location?: string;
  bio: string;
  interests: string[];
  photos: string[];
};

const { width } = Dimensions.get("window");

const mockProfile: Profile = {
  id: "u1",
  name: "Alex Parker",
  age: 29,
  location: "Seattle, WA",
  bio:
    "Outdoor lover, coffee enthusiast, and amateur photographer. Looking for someone to explore weekend hikes and obscure record stores with.",
  interests: ["Hiking", "Coffee", "Photography", "Vinyl", "Board Games"],
  photos: [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80&auto=format&fit=crop",
  ],
};

export default function ProfileScreen() {
  const [profile] = useState<Profile>(mockProfile);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList<string>>(null);

  const onScroll = (event: any) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeIndex) setActiveIndex(slide);
  };

  const renderPhoto = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.photo} />
  );

  return (
    <ScrollView contentContainerStyle={[styles.container]}>
      <View style={styles.card}>
        <FlatList
          ref={flatRef}
          data={profile.photos}
          keyExtractor={(item, i) => `${item}-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          renderItem={renderPhoto}
          style={styles.carousel}
        />
        <View style={styles.dots}>
          {profile.photos.map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.info} >
          <View style={styles.header}>
            <Text style={styles.name}>
              {profile.name}, <Text style={styles.age}>{profile.age}</Text>
            </Text>
            {profile.location ? <Text style={styles.location}>{profile.location}</Text> : null}
          </View>

          <Text style={styles.bio}>{profile.bio}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interests}>
              {profile.interests.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.messageButton]}>
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.likeButton]}>
          <Text style={[styles.actionText, styles.likeText]}>Like</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const PHOTO_HEIGHT = width * 1.3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  card: {
    width: width,
    backgroundColor: "#ffffff",
    //borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  carousel: {
    width: "100%",
    height: PHOTO_HEIGHT,
    backgroundColor: "#eee",
  },
  photo: {
    width: width,
    height: PHOTO_HEIGHT,
    resizeMode: "cover",
  },
  dots: {
    position: "absolute",
    top: PHOTO_HEIGHT - 28,
    left: 16,
    flexDirection: "row",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 10,
    height: 10,
  },
  info: {
    height: 'auto',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  age: {
    fontWeight: "600",
    color: "#444",
  },
  location: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  section: {
    height: 'auto',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
  },
  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    justifyContent: "space-between",
    position: 'absolute',
    bottom: 50
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  messageButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  likeButton: {
    backgroundColor: "#000",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  likeText: {
    color: "#fff",
  },
});