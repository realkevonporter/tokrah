import { signOutUser, updateUserInfo } from "@/api/auth";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { authUserAtom } from "@/storage/atom/auth.atom";
import { inchesToFeetInches } from "@/utils/inches-to-feet-inches";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { router } from "expo-router";
import { useAtom } from "jotai";
import React, { useCallback, useMemo, useState } from "react";
import DatePicker from "react-native-modern-datepicker";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { uploadMedia } from "@/storage/supabase/uploadImageVideo";
import api from "@/api";
import SortableGrid from "@/components/SortableGrid";

export default function EditScreen() {
  const [authUser, setAuthUser] = useAtom(authUserAtom);

  // Local UI state
  const [displayName, setDisplayName] = useState(authUser?.name);
  const [bio, setBio] = useState(authUser?.bio);
  const [liveHeight, setLiveHeight] = useState(authUser?.height);
  const [selectedDate, setSelectedDate] = useState(authUser?.birthdate ?? null);

  const [loading, setLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

  const safe = useSafeAreaInsets();

  // -----------------------------
  // MEDIA HANDLING
  // -----------------------------
  const pickMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
    });

    if (!result.canceled) return result.assets[0].uri;
    return null;
  }, []);

  const handleAddMedia = useCallback(async () => {
    if (authUser?.medias?.length >= 7) {
      Alert.alert("Limit reached", "You can only upload up to 7 media.");
      return;
    }

    const uri = await pickMedia();
    if (!uri) return;

    setMediaLoading(true);

    try {
      const uploaded = await uploadMedia(uri, authUser.id);

      const newMedia = {
        ...uploaded,
        position: authUser.medias.length,
      };

      // Local update
      setAuthUser((prev) => ({
        ...prev,
        medias: [...prev.medias, newMedia],
      }));

      await api.post("/v1/users/media", newMedia);
    } catch (err) {
      Alert.alert("Upload failed", String(err));
    } finally {
      setMediaLoading(false);
    }
  }, [authUser, pickMedia, setAuthUser]);

  const handleReorderMedia = useCallback(
    (newOrder) => {
      const reordered = newOrder.map((m, index) => ({
        ...m,
        position: index,
      }));

      setAuthUser((prev) => ({
        ...prev,
        medias: reordered,
      }));

      api.post("/v1/users/media/reorder", {
        medias: reordered.map((m) => ({
          id: m.id,
          position: m.position,
        })),
      });
    },
    [setAuthUser]
  );

  // -----------------------------
  // ACCOUNT INFO
  // -----------------------------
  const handleUpdateNameAndBirthday = useCallback(async () => {
    setLoading(true);

    try {
      const payload = { name: displayName };

      if (!authUser.birthdate && selectedDate) {
        payload.birthdate = selectedDate;
      }

      await updateUserInfo(payload);

      setAuthUser((prev) => ({
        ...prev,
        ...payload,
      }));
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }, [displayName, selectedDate, authUser, setAuthUser]);

  const handleBio = useCallback(async () => {
    setLoading(true);

    try {
      await updateUserInfo({ bio, height: liveHeight });
      setAuthUser((prev) => ({ ...prev, bio, height: liveHeight }));
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }, [bio, setAuthUser]);

  // -----------------------------
  // COMPONENTS
  // -----------------------------
  const AccountSection = useMemo(
    () =>
      React.memo(({ title, children }) => (
        <ThemedView
          darkColor={Colors.dark.background}
          lightColor="#e0e1e3ff"
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          {children}
        </ThemedView>
      )),
    []
  );

  const HeightSlider = useMemo(
    () =>
      React.memo(({ defaultHeight, onLiveChange, onCommit }) => {
        const [height, setHeight] = useState(defaultHeight);

        return (
          <MultiSlider
            values={[height]}
            min={1}
            max={100}
            step={1}
            onValuesChange={(v) => {
              const h = v[0];
              setHeight(h);
              onLiveChange(h);
            }}
            onValuesChangeFinish={(v) => onCommit(v[0])}
            sliderLength={300}
            trackStyle={styles.track}
            markerStyle={styles.marker}
            selectedStyle={styles.selected}
            unselectedStyle={styles.unselected}
          />
        );
      }),
    []
  );

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { top: safe.top }]}
      >
        <ThemedView darkColor={Colors.dark.background3}>
          {/* Back Button */}
          <View style={{ marginBottom: 30, flexDirection: "row" }}>
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: "row" }}
            >
              <MaterialCommunityIcons name="arrow-left" size={30} />
              <ThemedText> Go back</ThemedText>
            </Pressable>
          </View>

          {/* MEDIA */}
          <AccountSection title="Media">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <SortableGrid
                medias={authUser.medias}
                onReorder={handleReorderMedia}
              />

              <Pressable
                onPress={handleAddMedia}
                style={styles.addMediaButton}
              >
                <MaterialCommunityIcons name="plus" size={24} />
              </Pressable>
            </View>

            {mediaLoading && (
              <ThemedView
                darkColor="#4b3f19ff"
                lightColor="#33333374"
                style={styles.loadingOverlay}
              >
                <ThemedText lightColor="#f7f7f7" type="subtitle">
                  Uploading...
                </ThemedText>
              </ThemedView>
            )}
          </AccountSection>

          {/* ACCOUNT INFO */}
          <AccountSection title="Account Info">
            <ThemedText style={styles.label}>Display name</ThemedText>
            <ThemedTextInput
              style={styles.input}
              onChangeText={setDisplayName}
              placeholder={displayName ?? "username"}
              autoCapitalize="words"
            />

            <ThemedText style={styles.label}>Birthdate</ThemedText>
            {authUser.birthdate ? (
              <ThemedText>{authUser.birthdate}</ThemedText>
            ) : (
              <DatePicker
                style={styles.datePicker}
                isGregorian
                onSelectedChange={setSelectedDate}
              />
            )}

            <Pressable
              onPress={handleUpdateNameAndBirthday}
              disabled={loading}
            >
              <ThemedView darkColor="#4b3f19ff" style={styles.buttonRow}>
                <ThemedText>
                  {loading ? "Updating..." : "Update"}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </AccountSection>

          {/* HEIGHT */}
          <AccountSection title="Height">
            <View style={styles.settingRow}>
              <ThemedText style={styles.label}>
                {inchesToFeetInches(liveHeight)}
              </ThemedText>

              <HeightSlider
                defaultHeight={authUser.height}
                onLiveChange={setLiveHeight}
                onCommit={(h) =>
                  setAuthUser((prev) => ({ ...prev, height: h }))
                }
              />
            </View>
          </AccountSection>

          {/* BIO */}
          <AccountSection title="Bio">
            <ThemedText style={styles.label}>Update your bio</ThemedText>
            <ThemedTextInput
              multiline
              style={[styles.input, { height: 300 }]}
              onChangeText={setBio}
              placeholder={
                authUser.bio ??
                "Add a bio to let people know more about you!"
              }
              autoCapitalize="none"
            />

            <Pressable onPress={handleBio} disabled={loading}>
              <ThemedView darkColor="#4b3f19ff" style={styles.buttonRow}>
                <ThemedText>
                  {loading ? "Working..." : "Update Bio"}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </AccountSection>

          {/* NOTIFICATIONS */}
          <AccountSection title="Notifications">
            <View style={styles.settingRow}>
              <View>
                <ThemedText style={styles.label}>
                  Email notifications
                </ThemedText>
                <ThemedText style={styles.small}>
                  Receive updates via email
                </ThemedText>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
          </AccountSection>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24, borderRadius: 20, padding: 10 },
  sectionTitle: { fontSize: 18, marginBottom: 20, padding: 10 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  small: { fontSize: 12, color: "#4a4a4a5c" },
  input: {
    backgroundColor: "#0000003e",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  buttonRow: {
    padding: 10,
    alignSelf: "flex-start",
    borderRadius: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addMediaButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#a5a5a53b",
  },
  loadingOverlay: {
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  datePicker: { borderRadius: 20, marginBottom: 10 },
  marker: {
    height: 20,
    width: 20,
    marginBottom: -15,
    borderRadius: 13,
    backgroundColor: Colors.dark.tint,
  },
  track: { height: 15, borderRadius: 8 },
  selected: { backgroundColor: "#fff9cfff" },
  unselected: { backgroundColor: "#e6e6e6" },
});
