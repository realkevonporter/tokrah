import { signOutUser } from "@/api/auth";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import {

Alert,
Button,
Image,
Modal,
Pressable,
ScrollView,
StyleSheet,
Switch,
Text,
TextInput,
TouchableOpacity,
View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
// optional navigation prop if used in a navigator
navigation?: any;
};

export default function SettingsScreen({ navigation }: Props) {
// Profile
const [displayName, setDisplayName] = useState<string>("Kevin Porter");
const [email, setEmail] = useState<string>("kevin@example.com");
const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

// Notifications
const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
const [pushNotifications, setPushNotifications] = useState<boolean>(false);

// Password change
const [currentPassword, setCurrentPassword] = useState<string>("");
const [newPassword, setNewPassword] = useState<string>("");
const [confirmPassword, setConfirmPassword] = useState<string>("");

// UI
const [loading, setLoading] = useState<boolean>(false);
const [avatarModalVisible, setAvatarModalVisible] = useState<boolean>(false);
const [tempAvatarUrl, setTempAvatarUrl] = useState<string>("");

const safe = useSafeAreaInsets()

// Simple validation
const isEmailValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const canSaveProfile = displayName.trim().length > 0 && isEmailValid(email);

const canChangePassword =
  currentPassword.length > 0 &&
  newPassword.length >= 8 &&
  newPassword === confirmPassword;

// Mock async call helper
const simulateNetwork = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function handleSaveProfile() {
  if (!canSaveProfile) {
    Alert.alert("Invalid data", "Please provide a valid name and email.");
    return;
  }
  setLoading(true);
  try {
    await simulateNetwork();
    // TODO: call API to update profile
    Alert.alert("Saved", "Profile updated successfully.");
  } catch (err) {
    Alert.alert("Error", "Failed to save profile.");
  } finally {
    setLoading(false);
  }
}

async function handleChangePassword() {
  if (!canChangePassword) {
    Alert.alert(
      "Invalid password",
      "Ensure current password is filled and new password matches confirmation (min 8 chars)."
    );
    return;
  }
  setLoading(true);
  try {
    await simulateNetwork();
    // TODO: call API to change password
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Alert.alert("Success", "Password changed.");
  } catch (err) {
    Alert.alert("Error", "Failed to change password.");
  } finally {
    setLoading(false);
  }
}

function handleToggleEmailNotifications(value: boolean) {
  setEmailNotifications(value);
  // TODO: persist preference
}

function handleTogglePushNotifications(value: boolean) {
  setPushNotifications(value);
  // TODO: persist preference
}

function handleOpenAvatarModal() {
  setTempAvatarUrl(avatarUrl ?? "");
  setAvatarModalVisible(true);
}

function handleSaveAvatar() {
  setAvatarUrl(tempAvatarUrl.trim() === "" ? null : tempAvatarUrl.trim());
  setAvatarModalVisible(false);
}

function handleSignOut() {
  Alert.alert("Sign out", "Are you sure you want to sign out?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Sign out",
      style: "destructive",
      onPress: async () => {
        setLoading(true);
        await signOutUser();
        setLoading(false);
        if (navigation && navigation.reset) {
          navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
        } else {
          Alert.alert("Signed out");
        }
      },
    },
  ]);
}

function handleDeleteAccount() {
  Alert.alert(
    "Delete account",
    "This action is permanent. Are you sure you want to delete your account?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          await simulateNetwork(1200);
          setLoading(false);
          // TODO: call delete account API
          Alert.alert("Account deleted");
          if (navigation && navigation.reset) {
            navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
          }
        },
      },
    ]
  );
}

type AccountSectionProps = {
  title: string;
  children: React.ReactNode;
};

const AccountSection = ({ title, children }: AccountSectionProps) => (
  <ThemedView darkColor={Colors.dark.background} lightColor="#e0e1e3ff" style={styles.section}>
    <ThemedText style={{fontSize:18, marginBottom:20}}>{title}</ThemedText>
    {children}
  </ThemedView>
);

return (
  <ThemedView darkColor={Colors.dark.background3}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.container, {top:safe.top}]}>

      <View style={{marginBottom:30, flexDirection:'row'}}>
        <Pressable onPress={()=>router.back()} style={{flexDirection:'row'}}>
          <MaterialCommunityIcons name="arrow-left" size={30} />
          <ThemedText> Go back</ThemedText>
        </Pressable>
      </View>
      <AccountSection title="Account Info">

        <ThemedText style={styles.label}>Display name</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="username"
          autoCapitalize="words"
        />

        <ThemedText style={styles.label}>Email</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable onPress={handleChangePassword} disabled={!canChangePassword || loading}>
        <ThemedView darkColor={'#4b3f19ff'} style={styles.buttonRow}>
          <ThemedText>{loading ? "Updating..." : "Update"}</ThemedText>
        </ThemedView>
      </Pressable>
      </AccountSection>

      <AccountSection title="Security">

        <ThemedText style={styles.label}>Current password</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          secureTextEntry
          autoCapitalize="none"
        />

        <ThemedText style={styles.label}>New password</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password (min 8 chars)"
          secureTextEntry
          autoCapitalize="none"
        />

        <ThemedText style={styles.label}>Confirm new password</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry
          autoCapitalize="none"
        />

      <Pressable onPress={handleChangePassword} disabled={!canChangePassword || loading}>
        <ThemedView darkColor={'#4b3f19ff'} style={styles.buttonRow}>
          <ThemedText>{loading ? "Working..." : "Change password"}</ThemedText>
        </ThemedView>
      </Pressable>
        
      </AccountSection>

      <AccountSection title="Notifications">
        <View style={styles.settingRow}>
          <View>
            <ThemedText style={styles.label}>Email notifications</ThemedText>
            <ThemedText style={styles.small}>Receive updates via email</ThemedText>
          </View>
          <Switch value={emailNotifications} onValueChange={handleToggleEmailNotifications} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <ThemedText style={styles.label}>Push notifications</ThemedText>
            <ThemedText style={styles.small}>Receive push alerts</ThemedText>
          </View>
          <Switch value={pushNotifications} onValueChange={handleTogglePushNotifications} />
        </View>
      </AccountSection>

      <AccountSection title="Danger zone">
        <View style={styles.dangerRow}>
          <Button title="Sign out" onPress={handleSignOut} color="#333" />
          <View style={{ height: 8 }} />
          <Button title="Delete account" onPress={handleDeleteAccount} color="#b00020" />
        </View>
      </AccountSection>

      {/* Avatar Modal (simple URL input fallback) */}
      <Modal visible={avatarModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.label}>Avatar image URL</Text>
            <TextInput
              style={styles.input}
              value={tempAvatarUrl}
              onChangeText={setTempAvatarUrl}
              placeholder="https://..."
              autoCapitalize="none"
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAvatar} style={[styles.modalButton, styles.modalPrimary]}>
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </ThemedView>
);
}

const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: "#fff" },
container: { padding: 16, paddingBottom: 40 },
section: { marginBottom: 24, borderRadius:20, padding:10, },
sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#eee", marginRight: 12 },
label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
small: { fontSize: 12, color: '#4a4a4a5c' },
input: {
  backgroundColor: "#0000003e",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  marginBottom: 12,
},
buttonRow: { padding:10, alignSelf:'flex-start', borderRadius:8},
settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
dangerRow: { marginTop: 8 },
modalBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  padding: 24,
},
modal: { backgroundColor: "#fff", borderRadius: 10, padding: 16 },
modalButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
modalPrimary: { backgroundColor: "#007aff" },
modalButtonText: { color: "#007aff", fontWeight: "600" },
});