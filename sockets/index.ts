import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL! || 'http://10.0.0.226:5000';

let socket: Socket | null = null;

export const connectSocket = (
  token: string
) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],

    auth: {
      token,
    },

    autoConnect: true,

    reconnection: true,

    reconnectionAttempts: Infinity,

    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log(
      "Socket connected:",
      socket?.id
    );
  });

  socket.on("disconnect", reason => {
    console.log(
      "Socket disconnected:",
      reason
    );
  });

  socket.on("connect_error", err => {
    console.log(
      "Socket error:",
      err.message
    );
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};