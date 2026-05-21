import api from "@/api";
import { authUserAtom } from "@/storage/atom/auth.atom";
import { Message } from "@/types/message.typ";
import { useGlobalSearchParams } from "expo-router";
import { LegendList } from "@legendapp/list";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  useColorScheme,
} from "react-native";

import { useAtomValue } from "jotai";
import * as Crypto from "expo-crypto";
import { getSocket } from "@/sockets";
import { Image } from "expo-image";
import { profilePlaceholder } from "@/utils/profile-avatar-placeholder";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { ThemedTextInput } from "@/components/themed-text-input";

const ChatScreen = () => {
  const authUser =
    useAtomValue(authUserAtom);

  const localUserId = authUser?.id;

  const { id } = useGlobalSearchParams<{ id?: string | string[]; }>();
  const { avatar } = useGlobalSearchParams<{ avatar?: string; }>();
  const { username } = useGlobalSearchParams<{ username?: string; }>();
  const { gender } = useGlobalSearchParams<{ gender?: string; }>();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const theme = useColorScheme()

  /*
   * SAFELY HANDLE ROUTE PARAM
   */
  const matchId = useMemo(() => {
    if (Array.isArray(id)) {
      return id[0];
    }

    return id;
  }, [id]);

  useEffect(() => {
    if (!matchId) return;

    const markAsRead = async () => {
      try {
        await api.post(
          "/v1/message/read",
          {
            matchId,
          }
        );
      } catch (err) {
        console.log(err);
      }
    };

    markAsRead();
  }, [matchId]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !matchId) return;

    socket.emit("conversation:join", {
      matchId,
    });

    socket.emit("conversation:read", {
      matchId,
    });

    return () => {
      socket.emit("conversation:leave", {
        matchId,
      });
    };
  }, [matchId]);

  /**
   * LISTEN FOR TYPING
   */

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleTyping = ({
      userId,
      typing,
    }: {
      userId: string;
      typing: boolean;
    }) => {
      if (userId === localUserId) {
        return;
      }

      setTypingUsers(prev => {
        if (typing) {
          return [...new Set([...prev, userId])];
        }

        return prev.filter(
          id => id !== userId
        );
      });
    };

    socket.on(
      "message:typing",
      handleTyping
    );

    return () => {
      socket.off(
        "message:typing",
        handleTyping
      );
    };
  }, [localUserId]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewMessage = (
      incomingMessage: Message & {
        tempId?: string;
      }
    ) => {
      setMessages(prev => {
        /**
         * REPLACE OPTIMISTIC MESSAGE
         */
        const filtered = prev.filter(
          msg =>
            msg.id !== incomingMessage.tempId
        );

        /**
         * PREVENT DUPLICATES
         */
        const exists = filtered.some(
          msg => msg.id === incomingMessage.id
        );

        if (exists) {
          return filtered;
        }

        return [
          ...filtered,
          incomingMessage,
        ].sort(
          (a, b) =>
            new Date(
              a.createdAt
            ).getTime() -
            new Date(
              b.createdAt
            ).getTime()
        );
      });
    };

    socket.on(
      "message:new",
      handleNewMessage
    );

    return () => {
      socket.off(
        "message:new",
        handleNewMessage
      );
    };
  }, []);

  const [text, setText] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const flatListRef =
    useRef<FlatList<Message>>(null);

  /*
   * FETCH MESSAGES
   */
  const fetchMessages =
    useCallback(async () => {
      if (!matchId) return;

      try {
        setLoading(true);

        const res = await api.post(
          "/v1/message/all",
          {
            matchId,
          }
        );

        console.log(
          "MESSAGES:",
          JSON.stringify(
            res.data,
            null,
            2
          )
        );

        setMessages(
          res.data.conversation ?? []
        );
      } catch (error) {
        console.log(
          "fetchMessages error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, [matchId]);

  /*
   * INITIAL FETCH
   */
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /*
   * AUTO SCROLL
   */
  const scrollToBottom =
    useCallback(() => {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd(
          {
            animated: true,
          }
        );
      });
    }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(
        scrollToBottom,
        50
      );

      return () =>
        clearTimeout(timeout);
    }
  }, [messages, scrollToBottom]);

  const handleTyping = (
    value: string
  ) => {
    setText(value);

    const socket = getSocket();

    socket?.emit("message:typing", {
      matchId,
      typing: value.length > 0,
    });
  };

  /*
   * SEND MESSAGE
   */
  const sendMessage =
    useCallback(async () => {
      const trimmed = text.trim();

      if (
        !trimmed ||
        sending ||
        !matchId ||
        !localUserId
      ) {
        return;
      }

      const socket = getSocket();

      if (!socket) return;

      const tempId =
        Crypto.randomUUID();

      /**
       * OPTIMISTIC MESSAGE
       */
      const optimisticMessage: Message =
      {
        id: tempId,
        text: trimmed,
        createdAt:
          new Date().toISOString(),
        senderId: localUserId,
      };

      /**
       * ADD TEMP MESSAGE
       */
      setMessages(prev => [
        ...prev,
        optimisticMessage,
      ]);

      setText("");

      setSending(true);

      socket.emit(
        "message:send",
        {
          matchId,
          text: trimmed,
          tempId,
        },

        (response: any) => {
          setSending(false);

          /**
           * FAILED
           */
          if (!response?.success) {
            setMessages(prev =>
              prev.filter(
                msg =>
                  msg.id !== tempId
              )
            );

            return;
          }

          /**
           * SUCCESS
           * realtime listener will handle replacement
           */
        }
      );
    }, [
      text,
      sending,
      matchId,
      localUserId,
    ]);

  /*
   * INPUT SUBMIT
   */
  const onSubmitEditing = () => {
    sendMessage();
  };

  /*
   * RENDER MESSAGE
   */
  const renderItem: ListRenderItem<Message> =
    useCallback(
      ({ item }) => {
        const isLocal = item.senderId === localUserId;

        return (
          <View
            style={[
              styles.messageRow,

              isLocal
                ? styles.messageRowRight
                : styles.messageRowLeft,
            ]}
          >
            <ThemedView
              style={[
                styles.bubble,

                isLocal
                  ? styles.bubbleRight
                  : styles.bubbleLeft,
              ]}
            >
              <Text
                style={[
                  styles.messageText,

                  isLocal
                    ? styles.messageTextRight
                    : styles.messageTextLeft,
                ]}
              >
                {item.text}
              </Text>

              <Text style={[styles.timeText, {color: isLocal ? '#00000067' : '#d1bb1049'}]}>
                {new Date(
                  item.createdAt
                ).toLocaleTimeString(
                  [],
                  {
                    hour:
                      "2-digit",
                    minute:
                      "2-digit",
                  }
                )}
              </Text>
            </ThemedView>
          </View>
        );
      },
      [localUserId]
    );

  /*
   * LOADING
   */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#000"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme === 'dark' ? Colors.dark.background : Colors.light.background }]}
      behavior={Platform.select({
        ios: "padding",
        android: undefined,
      })}
    >
      <View style={[styles.header, {borderColor:theme === 'dark' ? '#222' : '#e1e1e1'}]}>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center', alignItems: 'center' }}>
          <Image
            source={
              avatar
                ? { uri: avatar }
                : profilePlaceholder(gender)
            }
            style={styles.avatar}
            contentFit="cover"
          />
          <ThemedText type="subtitle">{username}</ThemedText>
        </View>
        <View>

        </View>


      </View>
      <ThemedView lightColor="#ffffff" darkColor="#000" style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item: Message) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.messagesContainer
          }
          onContentSizeChange={
            scrollToBottom
          }
          removeClippedSubviews
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
        />
      </ThemedView>

      {typingUsers.length > 0 && (
        <Text style={{ padding: 8 }}>
          Typing...
        </Text>
      )}

      <ThemedView style={[styles.composer, {borderColor:theme === 'dark' ? '#222' : '#e1e1e1'}]}>
        <ThemedTextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={handleTyping}
          multiline
          returnKeyType="send"
          onSubmitEditing={
            onSubmitEditing
          }
        />

        <TouchableOpacity
          style={[
            styles.sendButton,

            (!text.trim() ||
              sending) &&
            styles
              .sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={
            !text.trim() ||
            sending
          }
        >
          <Text
            style={styles.sendText}
          >
            {sending
              ? "..."
              : "Send"}
          </Text>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingTop:80,

    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth:.5,
    //backgroundColor:Colors.light.tint,
    //borderBottomColor: Colors.light.tint
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  messagesContainer: {
    padding: 12,
    paddingBottom: 20,
    flexGrow: 1,
    justifyContent: "flex-end",
  },

  messageRow: {
    marginBottom: 10,
    flexDirection: "row",
  },

  messageRowLeft: {
    justifyContent: "flex-start",
  },

  messageRowRight: {
    justifyContent: "flex-end",
  },

  bubble: {
    maxWidth: "80%",

    paddingVertical: 8,
    paddingHorizontal: 12,

    borderRadius: 14,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },

  bubbleLeft: {
    borderTopLeftRadius: 4,
    backgroundColor: '#2a281ed5'
  },

  bubbleRight: {
    backgroundColor: "#e0bf02ff",
    borderTopRightRadius: 4,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },

  messageTextLeft: {
    color: "#f7f7f7",
  },

  messageTextRight: {
    color: "#000",
  },

  timeText: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },

  composer: {
    flexDirection: "row",

    padding: 8,
    paddingHorizontal: 12,

    alignItems: "flex-end",

    borderTopWidth:
      .5,

  },

  input: {
    flex: 1,

    minHeight: 40,
    maxHeight: 120,

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 20,

    marginRight: 8,

    fontSize: 15,
  },

  sendButton: {
    backgroundColor: "#e0bf02ff",

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#e0bf024f",
  },

  sendText: {
    color: "#000000ff",
    fontWeight: "600",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 28,
    marginRight: 5,
    backgroundColor: "#e5e7eb",
  },
});