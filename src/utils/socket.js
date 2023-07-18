import { io } from "socket.io-client";

export default function connectSocket() {
  const socket = io(location.origin, {
    withCredentials: true,
  });
  return socket;
}

