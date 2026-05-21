
import { Stack } from "expo-router";

export default function AppLayout() {

  return <Stack>
    <Stack.Screen name="(app)" options={{headerShown:false}} />
    <Stack.Screen name="(tabs)" options={{headerShown:false}} />
    <Stack.Screen name="conversation" options={{headerShown:false}} />
    <Stack.Screen name="profile" options={{headerShown:false, gestureDirection:'horizontal'}} />
    <Stack.Screen name="account" options={{headerShown:false, presentation:'modal'}} />
    <Stack.Screen name="setting" options={{headerShown:false, presentation:'fullScreenModal', gestureDirection:'horizontal'}} />
    <Stack.Screen name="edit" options={{headerShown:false, presentation:'fullScreenModal', gestureDirection:'horizontal'}} />
    <Stack.Screen name="filter" options={{headerShown:false, presentation:'modal', gestureDirection:'vertical'}} />
    <Stack.Screen name="post" options={{headerShown:false, presentation:'formSheet', gestureDirection:'horizontal'}} />
    <Stack.Screen name="comment-sheet" options={{headerShown:false, presentation:'card'}} />
  </Stack>;
}