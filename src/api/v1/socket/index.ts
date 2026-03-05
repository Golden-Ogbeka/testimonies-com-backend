import { Server } from "socket.io";

const _onlineUsers = new Map<string, string>(); // { userId: socketId }

export const socketHandler = (_io: Server) => {};
