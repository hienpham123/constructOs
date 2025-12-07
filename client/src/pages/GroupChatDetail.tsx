import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useAuthStore } from '../stores/authStore';
import { getFileIcon, isImageFile, formatFileSize } from '../utils/fileHelpers';
import EditGroupDialog from '../components/groupChat/EditGroupDialog';
import GroupChatHeader from '../components/groupChat/GroupChatHeader';
import GroupMenuPopover from '../components/groupChat/GroupMenuPopover';
import MessageList from '../components/groupChat/MessageList';
import MessageInput from '../components/groupChat/MessageInput';
import MembersDialog from '../components/groupChat/MembersDialog';
import DeleteMessageDialog from '../components/groupChat/DeleteMessageDialog';
import DeleteGroupDialog from '../components/groupChat/DeleteGroupDialog';
import {
  groupChatsAPI,
  type GroupDetail,
  type GroupMessage,
} from '../services/api/groupChats';
import { io, Socket } from 'socket.io-client';

export default function GroupChatDetail() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuthStore();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [groupMenuAnchor, setGroupMenuAnchor] = useState<HTMLElement | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (id) {
      loadGroup();
      loadMessages();
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    // Only auto-scroll if not currently submitting a message
    if (!isSubmittingRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const connectSocket = () => {
    if (!id) return;

    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.warn('No auth token found for socket connection');
      return;
    }

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:2222', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join-groups');
      socket.emit('join-group', id);
    });

    socket.on('message-received', (data: { groupId: string; message: GroupMessage }) => {
      if (data.groupId === id) {
        const shouldAutoScroll = !isSubmittingRef.current;
        setMessages((prev) => [...prev, data.message]);
        if (shouldAutoScroll) {
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    });

    socketRef.current = socket;
  };

  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: instant ? 'auto' : 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  };

  const loadGroup = async (preserveScroll = false) => {
    if (!id) return;
    try {
      const messagesContainer = document.querySelector('[data-messages-container]') as HTMLElement;
      const scrollTop = messagesContainer?.scrollTop || 0;

      setIsLoading(true);
      const data = await groupChatsAPI.getGroupById(id);
      setGroup(data);

      if (preserveScroll && messagesContainer) {
        setTimeout(() => {
          messagesContainer.scrollTop = scrollTop;
        }, 0);
      }
    } catch (error: any) {
      console.error('Error loading group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!id) return;
    try {
      const data = await groupChatsAPI.getMessages(id, 100, 0);
      setMessages(data);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      return;
    }

    if (!user || !id) {
      return;
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;
    try {
      const newMessage = await groupChatsAPI.sendMessage(
        id,
        content.trim() || '',
        selectedFiles.length > 0 ? selectedFiles : undefined
      );

      setMessages((prev) => [...prev, newMessage]);
      setContent('');
      setSelectedFiles([]);

      if (socketRef.current) {
        socketRef.current.emit('new-message', {
          groupId: id,
          message: newMessage,
        });
      }

      setTimeout(() => {
        if (lastMessageRef.current) {
          lastMessageRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
          });
        } else {
          scrollToBottom(false);
        }
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
        setTimeout(() => {
          isSubmittingRef.current = false;
        }, 300);
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Không thể gửi tin nhắn');
      isSubmittingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      await groupChatsAPI.deleteMessage(messageToDelete);
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));
      setDeleteConfirmOpen(false);
      setMessageToDelete(null);
    } catch (error: any) {
      console.error('Error deleting message:', error);
      alert(error.response?.data?.error || 'Không thể xóa tin nhắn');
    }
  };

  const handleEditClick = (messageId: string) => {
    setEditingMessageId(messageId);
    setAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, messageId: string) => {
    setAnchorEl(event.currentTarget);
    setHoveredMessageId(messageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setHoveredMessageId(null);
  };

  const handleImageError = (attachmentId: string) => {
    setImageErrors((prev) => new Set(prev).add(attachmentId));
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  if (!group) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Không tìm thấy nhóm</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: '#f0f2f5', overflow: 'hidden' }}>
      <GroupChatHeader
        group={group}
        onMembersClick={() => setMembersDialogOpen(true)}
        onMenuClick={(e) => setGroupMenuAnchor(e.currentTarget)}
      />

      <GroupMenuPopover
        open={Boolean(groupMenuAnchor)}
        anchorEl={groupMenuAnchor}
        onClose={() => setGroupMenuAnchor(null)}
        group={group}
        groupId={id}
        currentUserId={user?.id}
        onEditClick={() => {
          setGroupMenuAnchor(null);
          setEditDialogOpen(true);
        }}
        onDeleteClick={() => {
          setGroupMenuAnchor(null);
          setDeleteGroupConfirmOpen(true);
        }}
        onGroupUpdate={(updatedGroup) => setGroup(updatedGroup)}
      />

      <MessageList
        messages={messages}
        currentUserId={user?.id}
        editingMessageId={editingMessageId}
        hoveredMessageId={hoveredMessageId}
        imageErrors={imageErrors}
        anchorEl={anchorEl}
        lastMessageRef={lastMessageRef}
        onMessageHover={setHoveredMessageId}
        onMessageLeave={() => setHoveredMessageId(null)}
        onMenuClick={handleMenuClick}
        onMenuClose={handleMenuClose}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onImageError={handleImageError}
        getFileIcon={getFileIcon}
        isImageFile={isImageFile}
        formatFileSize={formatFileSize}
      />

      {!editingMessageId && (
        <MessageInput
          groupName={group.name}
          content={content}
          selectedFiles={selectedFiles}
          isSubmitting={isSubmitting}
          textInputRef={textInputRef}
          imageInputRef={imageInputRef}
          fileInputRef={fileInputRef}
          onContentChange={setContent}
          onFileSelect={handleFileSelect}
          onRemoveFile={removeFile}
          onSubmit={handleSubmit}
        />
      )}

      <MembersDialog
        open={membersDialogOpen}
        onClose={() => setMembersDialogOpen(false)}
        group={group}
      />

      <DeleteMessageDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <DeleteGroupDialog
        open={deleteGroupConfirmOpen}
        onClose={() => setDeleteGroupConfirmOpen(false)}
        onConfirm={async () => {
          if (!id) return;
          try {
            await groupChatsAPI.deleteGroup(id);
            window.location.href = '/group-chats';
          } catch (error: any) {
            alert(error.response?.data?.error || 'Không thể xóa nhóm');
          }
        }}
        groupName={group?.name || null}
      />

      <EditGroupDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        group={group}
        onSuccess={() => {
          if (id) {
            loadGroup();
          }
        }}
      />
    </Box>
  );
}
