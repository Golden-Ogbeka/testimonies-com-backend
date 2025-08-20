import { Server } from 'socket.io';

const onlineUsers = new Map<string, string>(); // { userId: socketId }

export const socketHandler = (io: Server) => {};
