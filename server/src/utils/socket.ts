import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { query } from '../config/db.js';
import type { AuthRequest } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

interface SocketUser {
  userId: string;
  socketId: string;
  groups: Set<string>; // Group IDs user is in
}

const connectedUsers = new Map<string, SocketUser>();

export function initializeSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Initialize user in connectedUsers
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, {
        userId,
        socketId: socket.id,
        groups: new Set(),
      });
    } else {
      const user = connectedUsers.get(userId)!;
      user.socketId = socket.id;
    }

    // Join user's groups
    socket.on('join-groups', async () => {
      try {
        const groups = await query<any[]>(
          'SELECT group_id FROM group_members WHERE user_id = ?',
          [userId]
        );

        const user = connectedUsers.get(userId);
        if (user) {
          groups.forEach((g) => {
            const groupId = `group-${g.group_id}`;
            socket.join(groupId);
            user.groups.add(g.group_id);
          });
        }

        console.log(`User ${userId} joined ${groups.length} groups`);
      } catch (error) {
        console.error('Error joining groups:', error);
      }
    });

    // Join a specific group
    socket.on('join-group', async (groupId: string) => {
      try {
        // Verify user is member
        const members = await query<any[]>(
          'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
          [groupId, userId]
        );

        if (members.length > 0) {
          const room = `group-${groupId}`;
          socket.join(room);
          
          const user = connectedUsers.get(userId);
          if (user) {
            user.groups.add(groupId);
          }

          console.log(`User ${userId} joined group ${groupId}`);
        }
      } catch (error) {
        console.error('Error joining group:', error);
      }
    });

    // Leave a group
    socket.on('leave-group', (groupId: string) => {
      const room = `group-${groupId}`;
      socket.leave(room);
      
      const user = connectedUsers.get(userId);
      if (user) {
        user.groups.delete(groupId);
      }

      console.log(`User ${userId} left group ${groupId}`);
    });

    // Typing indicator
    socket.on('typing-start', async (groupId: string) => {
      try {
        // Verify user is member
        const members = await query<any[]>(
          'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
          [groupId, userId]
        );

        if (members.length > 0) {
          const room = `group-${groupId}`;
          
          // Get user info
          const users = await query<any[]>(
            'SELECT id, name, avatar FROM users WHERE id = ?',
            [userId]
          );

          if (users.length > 0) {
            socket.to(room).emit('user-typing', {
              groupId,
              userId,
              userName: users[0].name,
              isTyping: true,
            });
          }
        }
      } catch (error) {
        console.error('Error handling typing start:', error);
      }
    });

    socket.on('typing-stop', async (groupId: string) => {
      try {
        const members = await query<any[]>(
          'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
          [groupId, userId]
        );

        if (members.length > 0) {
          const room = `group-${groupId}`;
          socket.to(room).emit('user-typing', {
            groupId,
            userId,
            isTyping: false,
          });
        }
      } catch (error) {
        console.error('Error handling typing stop:', error);
      }
    });

    // Handle new message (broadcast to group)
    socket.on('new-message', async (data: { groupId: string; message: any }) => {
      try {
        const { groupId, message } = data;
        
        // Verify user is member
        const members = await query<any[]>(
          'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
          [groupId, userId]
        );

        if (members.length > 0) {
          const room = `group-${groupId}`;
          
          // Broadcast to all members except sender
          socket.to(room).emit('message-received', {
            groupId,
            message,
          });

          // Update unread count for other members
          const allMembers = await query<any[]>(
            'SELECT user_id FROM group_members WHERE group_id = ? AND user_id != ?',
            [groupId, userId]
          );

          allMembers.forEach((member) => {
            const memberUser = connectedUsers.get(member.user_id);
            if (memberUser) {
              // Notify user about new message
              io.to(memberUser.socketId).emit('unread-updated', {
                groupId,
              });
            }
          });
        }
      } catch (error) {
        console.error('Error broadcasting message:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
      
      // Check if user has other connections
      const user = connectedUsers.get(userId);
      if (user && user.socketId === socket.id) {
        // Remove user if this was their only connection
        connectedUsers.delete(userId);
      }
    });
  });

  return io;
}

export function getIO() {
  // This will be set after initialization
  return (global as any).io;
}

