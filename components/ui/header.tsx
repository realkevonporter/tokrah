import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, useColorScheme, View } from "react-native";
import { ThemedText } from "../themed-text";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useBottomSheet } from "@/bottomsheet/BottomSheetProvider";
import { useAtomValue } from "jotai";
import { authUserAtom } from "@/storage/atom/auth.atom";
import { profilePlaceholder } from "@/utils/profile-avatar-placeholder";
import { Image } from "expo-image";
import { useState } from "react";

export default function Header() {
    const authUser = useAtomValue(authUserAtom)
    const { openSheet } = useBottomSheet();
    const theme = useColorScheme()
    const [imageError, setImageError] = useState(false)

  return (
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, marginBottom:10}}>
          <Pressable onPress={() => openSheet('filter')} style={{width:30, height:30, borderRadius:6, alignItems:'center', justifyContent:'center'}}>
           <MaterialCommunityIcons name="tune" size={30} color={Colors[theme === 'dark' ? 'dark' : 'light'].text} />
          </Pressable>
          <ThemedText type="title" style={{alignSelf:'center'}}>Tokrah
            {/* <ThemedText>Knit</ThemedText> */}
            </ThemedText>
          <Pressable onPress={() => router.navigate("/account")} style={{width:30, height:30, borderRadius:6, backgroundColor:'#e5e7eb', alignItems:'center', justifyContent:'center', overflow:'hidden'}}>
            <Image
            contentPosition="top center"
            source={imageError || authUser?.medias.length === 0 ? profilePlaceholder(authUser?.gender) : authUser?.medias?.[0]?.url}
            onError={()=>setImageError(true)} style={{width:30, height:30}} />
          </Pressable>
        </View>
  );
}
