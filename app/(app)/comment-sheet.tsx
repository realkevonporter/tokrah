import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native'
import React, { useState } from 'react'
import { ThemedView } from '@/components/themed-view'
import { ThemedTextInput } from '@/components/themed-text-input'
import { ThemedText } from '@/components/themed-text'
import PostButton from '@/components/post-button'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Color } from 'expo-router'
import { Colors } from '@/constants/theme'
import { makePost } from '@/api/post'
import { Post } from '@/types/post.type'
import { Image } from 'expo-image'
import { profilePlaceholder } from '@/utils/profile-avatar-placeholder'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CommentCard } from '@/bottomsheet/CommentCard'

export default function CommentScreen(id:string) {
  const theme = useColorScheme()
  const [privacy, setPrivacy] = useState<boolean>(true)
  const [text, setText] = useState<string>('')
  const [feeling, setFeeling] = useState<string | null>(null)
  const {top, bottom} = useSafeAreaInsets()

function FeedPost({
  item,
  onLike,
}: {
  item: Post;
  onLike: (id: string) => void;
}) {
  const [avatarError, setAvatarError] = useState(false);
  return (
    <ThemedView
      darkColor={Colors.dark.card.background}
      lightColor="#ffffff"
      style={styles.card}
    >
      <View style={[styles.header,{paddingTop:top}]}>
        <Image
          placeholder={profilePlaceholder(item.author.gender)}
          placeholderContentFit="cover"
          contentFit="cover"
          transition={150}
          onError={() => setAvatarError(true)}
          source={
            avatarError || !item.author.medias?.[0]?.url
              ? profilePlaceholder(item.author.gender)
              : { uri: item.author.medias[0].url }
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

const fakePost: Post = {
  id: "post_12345",
  text: "Just finished a long day of coding and I feel surprisingly optimistic about the project!",
  feeling: "optimistic",
  medias: [
    {
      type: "image",
      url: "https://picsum.photos/600/400?random=12"
    }
  ],
  author: {
    id: "user_987",
    username: "dev_journey",
    gender: "male",
    medias: [
      {
        type: "image",
        url: "https://picsum.photos/200/200?random=5"
      }
    ]
  },
  createdAt: new Date().toISOString(),
  likes: 12,
  liked: false,
  comments: 3
};


  return (<ThemedView darkColor={'#000'} style={{flex:1}}>
    <KeyboardAvoidingView style={{ flex: 1}}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}>
<View style={{flex:1}}>
   <FlatList
   showsVerticalScrollIndicator={false}
          ListHeaderComponent={()=><FeedPost item={fakePost} onLike={()=>{}}/>}
          data={[0,1,2,3,4,5,6,7,8,9]}
          renderItem={()=><CommentCard />}
          />

        

      
      <View style={styles.textInputWrapper}>
          <ThemedTextInput  onChangeText={()=>{}} placeholder='leave a comment' lightColor={Colors.light.text} style={styles.textInput} />
        </View>
</View>
         
    </KeyboardAvoidingView></ThemedView>
  )
}

const styles = StyleSheet.create({

  textInputWrapper: {
    bottom:0,
    padding:5,
    height:60,
    borderTopWidth:.5,
    borderColor:'#aaaaaa35'
  },
  textInput: {
    flex:1,
    padding: 10,
    borderRadius:5,
  },


  //card

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
})