
import { io } from "socket.io-client";

let socket = null;

export const getSocket = async (token) => {
  if (!socket) {
    socket = io("http://localhost:3001", {
      // auth: { token },
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect_error", async (err) => {
      console.error("Socket connection error:", err.message);
    });
  }

  socket.auth.token = token;
  if (!socket.connected) socket.connect();

  return socket;
};

export const attachListener = (event, cb) => {
  if (!socket) return;
  socket.off(event);
  socket.on(event, cb);
};
