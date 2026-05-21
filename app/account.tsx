import { createReferral } from "@/api/referral";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { authUserAtom } from "@/storage/atom/auth.atom";
import { useAtomValue } from "jotai";
import { LinearGradient } from "expo-linear-gradient"
import React, { useState } from "react";
import * as Location from 'expo-location';
import {

  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  ScrollView,
  Dimensions,
  Pressable,
  useColorScheme,
  ImageSourcePropType,
} from "react-native";
import { Gender } from "@/enums/gender.enum";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { authLocationAtom } from "@/storage/atom/location.atom";
import { router } from "expo-router";
import { profilePlaceholder } from "@/utils/profile-avatar-placeholder";
import { Image } from "expo-image";

export default function AccountScreen() {

  const screen = Dimensions.get('screen');

  const authUser = useAtomValue(authUserAtom);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const location = useAtomValue(authLocationAtom);
  const [imageError, setImageError] = useState(false);

  const theme = useColorScheme()

  async function makeReferralCode(length = 8) {
    const res = await createReferral();
    return res;
  }


  async function handleGenerate() {
    setLoading(true);
    try {
      // simulate API call / validation
      const code = await makeReferralCode(6);
      setReferralCode(code);
    } catch (err) {
      Alert.alert("Error", "Unable to generate referral code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!referralCode) {
      Alert.alert("No code", "Generate a referral code first.");
      return;
    }
    try {
      await Share.share({
        title: "Join with my referral code",
        message: `Use my referral code: ${referralCode}`,
      });
    } catch (err) {
      Alert.alert("Error", "Unable to open share dialog.");
    }
  }

  async function handleSaveToServer() {
    if (!referralCode) {
      Alert.alert("No code", "Generate a referral code first.");
      return;
    }
    setSaving(true);
    try {
      // Replace this stub with a real API call.
      await new Promise((r) => setTimeout(r, 900));
      Alert.alert("Saved", "Referral code saved to your account.");
    } catch (err) {
      Alert.alert("Error", "Failed to save referral code.");
    } finally {
      setSaving(false);
    }
  }

  const userAddress = ()=>{
    return authUser?.address?.district+", "+authUser?.address?.city+" "+authUser?.address?.region+", "+authUser?.address?.isoCountryCode
  }

  return (
    <ScrollView style={{ flex: 1, height: screen.height }}>
      <View>
        <Image
        contentPosition="top center"
        source={imageError || authUser?.medias.length === 0 ? profilePlaceholder(authUser?.gender) : authUser?.medias?.[0]?.url}
        onError={() => setImageError(true)}
        style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, width: screen.width, height: screen.height * .5 }} />
        <LinearGradient style={{width: screen.width, height: screen.height * .5, position:'absolute'}} colors={['transparent', theme === 'dark' ? Colors.dark.background3 : Colors.light.background3]}>
      <Pressable onPress={()=>router.navigate('/setting')} style={{position:'absolute', top:20, right:20}}>
        <ThemedView style={{width:35, height:35, borderRadius:18, justifyContent:'center', alignItems:'center'}}>
          <MaterialCommunityIcons color={theme === 'dark' ? Colors.dark.text : Colors.light.text} name="cog" size={20} />
        </ThemedView>
      </Pressable>

      <Pressable onPress={()=>router.navigate('/edit')} style={{position:'absolute', top:75, right:20}}>
        <ThemedView style={{width:35, height:35, borderRadius:18, justifyContent:'center', alignItems:'center'}}>
          <MaterialCommunityIcons color={theme === 'dark' ? Colors.dark.text : Colors.light.text} name="pen" size={20} />
        </ThemedView>
        
      </Pressable>
      </LinearGradient>
      </View>
      


      <ThemedView lightColor={'#e1e1e1'} style={styles.container}>










        <ThemedView darkColor={Colors.dark.background3} style={[styles.card,{borderTopLeftRadius:0, borderTopRightRadius:0}]}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <ThemedText style={styles.value}>{authUser?.username}</ThemedText>

          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value}>{authUser?.email}</ThemedText>

          <ThemedText style={styles.label}>Last Location</ThemedText>
          <ThemedText style={styles.value}>{userAddress()}</ThemedText>
          <ThemedText style={{fontSize:12}}>(this is not public)</ThemedText>
        </ThemedView>

        <ThemedView darkColor={Colors.dark.background3} style={styles.card}>
          <ThemedText style={styles.label}>Share Referral Code with friends you'd like to join.</ThemedText>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 12 }} />
          ) : referralCode ? (
            <View style={styles.codeRow}>
              <ThemedText style={styles.code}>{referralCode}</ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.hint}>You referred 0 members.</ThemedText>
          )}

          <View style={styles.buttonsRow}>
            <Pressable
            style={{flex:3}}
              onPress={handleGenerate}
              disabled={loading}>
              <ThemedView lightColor="#000" darkColor="#f7f7f7" style={styles.primaryBtn}>
                <ThemedText lightColor='#f7f7f7' darkColor="#000" style={styles.primaryBtnText}>
                  {referralCode ? "Regenerate" : "Generate"}
                </ThemedText>
              </ThemedView>
            </Pressable>

            <Pressable
              style={[styles.outlineBtn, {borderColor:theme === 'dark' ? Colors.dark.text : Colors.light.text }]}
              onPress={handleShare}
              disabled={!referralCode}
            >
              <ThemedText style={styles.outlineBtnText}>Share</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.outlineBtn, {borderColor:theme === 'dark' ? Colors.dark.text : Colors.light.text }]}
              onPress={handleSaveToServer}
              disabled={!referralCode || saving}
            >
              {saving ? (
                <ActivityIndicator color={theme === 'dark' ? Colors.dark.text : Colors.light.text } />
              ) : (
                <ThemedText style={styles.outlineBtnText}>Save</ThemedText>
              )}
            </Pressable>
          </View>
        </ThemedView>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  value: {
    fontSize: 16,
    marginBottom: 0,
  },
  hint: {
    fontSize: 14,
    color: "#444",
    marginVertical: 12,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  code: {
    fontSize: 20,
    fontWeight: "700",
  },
  buttonsRow: {
    flex:1,
    borderRadius: 15,
    flexDirection: "row",
    marginTop: 8,
    //backgroundColor:'pink',
    gap:10,
    //justifyContent: 'space-around',
  },
  primaryBtn: {
    flex:2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems:'center'
  },
  primaryBtnText: {
    fontWeight: "600",
  },
  outlineBtn: {
    flex:1,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems:'center'
  },
  outlineBtnText: {
    fontWeight: "600",
  },
});