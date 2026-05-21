import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native'
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

export default function PostScreen() {
  const theme = useColorScheme()
  const [privacy, setPrivacy] = useState<boolean>(true)
  const [text, setText] = useState<string>('')
  const [feeling, setFeeling] = useState<string | null>(null)

  const createPost = async()=>{
    try{
      const feedType = privacy ? 'PRIVATE' : 'PUBLIC'
      const res:Post = await makePost(text, feedType)
      return res
    }catch(error){
      console.log(error)
    }
    
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}>
      <ThemedView style={styles.container}>
        <View style={styles.textInputWrapper}>
          <ThemedTextInput value={text} onChangeText={setText} placeholder='Whats on your mind?' lightColor={Colors.light.text} style={styles.textInput} multiline />
        </View>
        <ThemedView lightColor={Colors.light.background2} style={styles.actionContainer}>
          <View style={styles.actionLeft}>

            <Pressable style={styles.actionButton}>
              <MaterialCommunityIcons name='multimedia' size={24} color={theme === 'dark' ? Colors.dark.text : Colors.light.text} />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <MaterialCommunityIcons name='emoticon-happy-outline' size={24} />
            </Pressable>

            <Pressable onPress={()=>setPrivacy(prev=>!prev)} style={styles.actionButton}>
              <MaterialCommunityIcons name={privacy ? 'eye-lock' :'eye-lock-open'} size={24} />
            </Pressable>

          </View>
          <Pressable onPress={createPost}>
            <ThemedView style={styles.postButton}>
              <ThemedText lightColor='#f7f7f7'>
                Post
              </ThemedText>
            </ThemedView>

          </Pressable>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputWrapper: {
    flex: 1,
    marginTop:50,
    padding:10
  },
  textInput: {
    flex:1,
    padding: 10,
    borderRadius:5,
  },
  actionContainer: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  postButton: {
    width: 100,
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    alignItems:'center'
  },
  actionLeft: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  actionButton: {
    padding: 5
  }
})