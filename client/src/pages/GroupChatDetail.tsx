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
import MessageEditBar from '../components/groupChat/MessageEditBar';
import MembersDialog from '../components/groupChat/MembersDialog';
import DeleteMessageDialog from '../components/groupChat/DeleteMessageDialog';
import DeleteGroupDialog from '../components/groupChat/DeleteGroupDialog';
import SearchPanel from '../components/groupChat/SearchPanel';
import FilePanel from '../components/groupChat/FilePanel';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const isLoadingMoreRef = useRef(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [groupMenuAnchor, setGroupMenuAnchor] = useState<HTMLElement | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const editingMessageRef = useRef<HTMLDivElement | null>(null);
  const isSubmittingRef = useRef(false);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (id) {
      // Reset states when switching groups
      setMessages([]);
      setHasMoreMessages(true);
      setIsLoading(true);
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
    // Only auto-scroll if not currently submitting a message and not loading more messages
    // Skip if messages array is empty (initial load will be handled by MessageList)
    // Skip initial load - MessageList handles it
    if (!isSubmittingRef.current && !isLoadingMoreRef.current && !isLoading && messages.length > 0) {
      // Only scroll for new messages (not initial load)
      // This is for when new messages arrive via socket
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Scroll to editing message when editingMessageId changes
    if (editingMessageId && editingMessageRef.current) {
      setTimeout(() => {
        editingMessageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }, 100);
    }
  }, [editingMessageId]);

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
    // Try multiple methods to ensure scroll works
    // First try the last message ref
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: instant ? 'auto' : 'smooth',
        block: 'end',
        inline: 'nearest',
      });
      return;
    }
    
    // Fallback: scroll the messages container directly
    const messagesContainer = document.querySelector('[data-messages-container]') as HTMLElement;
    if (messagesContainer) {
      if (instant) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth',
        });
      }
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
      const data = await groupChatsAPI.getMessages(id, 50, 0);
      setMessages(data);
      // Check if there are more messages (if we got 50, there might be more)
      setHasMoreMessages(data.length === 50);
      // Don't scroll here - let MessageList handle initial scroll
      // This prevents conflicts and ensures messages are fully rendered before scrolling
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const loadMoreMessages = async () => {
    if (!id || isLoadingMore || !hasMoreMessages) return;
    
    setIsLoadingMore(true);
    isLoadingMoreRef.current = true;
    try {
      const messagesContainer = document.querySelector('[data-messages-container]') as HTMLElement;
      if (!messagesContainer) {
        setIsLoadingMore(false);
        isLoadingMoreRef.current = false;
        return;
      }
      
      // Get current scroll position and height before adding new messages
      const previousScrollTop = messagesContainer.scrollTop;
      const previousScrollHeight = messagesContainer.scrollHeight;
      
      // Load only 50 messages at a time
      const currentOffset = messages.length;
      const data = await groupChatsAPI.getMessages(id, 50, currentOffset);
      
      if (data.length === 0) {
        setHasMoreMessages(false);
      } else {
        // Prepend older messages to the beginning
        setMessages((prev) => [...data, ...prev]);
        
        // Restore scroll position after new messages are added
        // Wait for React to update DOM, then restore scroll position
        setTimeout(() => {
          if (messagesContainer) {
            const newScrollHeight = messagesContainer.scrollHeight;
            const heightDifference = newScrollHeight - previousScrollHeight;
            // Set scroll position to maintain the same visual position
            messagesContainer.scrollTop = previousScrollTop + heightDifference;
          }
          // Reset ref after a bit more delay to ensure scroll position is set
          setTimeout(() => {
            isLoadingMoreRef.current = false;
          }, 100);
        }, 50);
        
        // Check if there are more messages (if we got less than 50, we've reached the end)
        setHasMoreMessages(data.length === 50);
      }
    } catch (error: any) {
      console.error('Error loading more messages:', error);
      isLoadingMoreRef.current = false;
    } finally {
      setIsLoadingMore(false);
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
    // Allow sending if there's content (even with only spaces) or files
    if (!content && selectedFiles.length === 0) {
      return;
    }

    if (!user || !id) {
      return;
    }

    isSubmittingRef.current = true;
    try {
      const newMessage = await groupChatsAPI.sendMessage(
        id,
        content || '', // Don't trim - allow all content including spaces
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
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setEditingContent(message.content);
    }
    setAnchorEl(null);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleEditSave = async () => {
    if (!editingMessageId || !editingContent) {
      return;
    }

    try {
      const updated = await groupChatsAPI.updateMessage(editingMessageId, editingContent);
      setMessages((prev) => prev.map((m) => (m.id === editingMessageId ? updated : m)));
      setEditingMessageId(null);
      setEditingContent('');
    } catch (error: any) {
      console.error('Error updating message:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể cập nhật tin nhắn';
      alert(errorMessage);
    }
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

  const handleSearchMessageClick = async (message: GroupMessage) => {
    // Close search panel
    setSearchPanelOpen(false);
    
    // Check if message is already in the current messages list
    const messageExists = messages.some((m) => m.id === message.id);
    
    if (!messageExists) {
      // Load messages around this message
      // First, try to load messages before this one
      try {
        const allMessages = await groupChatsAPI.getMessages(id!, 100, 0);
        const messageIndex = allMessages.findIndex((m) => m.id === message.id);
        
        if (messageIndex !== -1) {
          // Message found in recent messages, set all messages
          setMessages(allMessages);
        } else {
          // Message not in recent 100, need to search and load context
          // For now, just add this message to the list
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === message.id);
            if (!exists) {
              return [...prev, message].sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
    
    // Scroll to message after a short delay to ensure DOM is updated
    setTimeout(() => {
      const messageElement = messageRefs.current.get(message.id);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the message briefly
        messageElement.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
          messageElement.style.backgroundColor = '';
        }, 2000);
      }
    }, 100);
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
        onSearchClick={() => {
          setFilePanelOpen(false);
          setSearchPanelOpen(true);
        }}
        onFilesClick={() => {
          setSearchPanelOpen(false);
          setFilePanelOpen(true);
        }}
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

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <MessageList
            messages={messages}
            currentUserId={user?.id}
            editingMessageId={editingMessageId}
            hoveredMessageId={hoveredMessageId}
            imageErrors={imageErrors}
            anchorEl={anchorEl}
            lastMessageRef={lastMessageRef}
            editingMessageRef={editingMessageRef}
            messageRefs={messageRefs}
            hasMoreMessages={hasMoreMessages}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMoreMessages}
            isLoadingMoreRef={isLoadingMoreRef}
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
              textInputRef={textInputRef}
              imageInputRef={imageInputRef}
              fileInputRef={fileInputRef}
              onContentChange={setContent}
              onFileSelect={handleFileSelect}
              onRemoveFile={removeFile}
              onSubmit={handleSubmit}
            />
          )}

          {editingMessageId && (
            <MessageEditBar
              editingContent={editingContent}
              onContentChange={setEditingContent}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
              disabled={!editingContent}
            />
          )}
        </Box>

        {searchPanelOpen && group && (
          <SearchPanel
            groupId={id!}
            members={group.members}
            onClose={() => setSearchPanelOpen(false)}
            onMessageClick={handleSearchMessageClick}
          />
        )}

        <FilePanel
          open={filePanelOpen}
          onClose={() => setFilePanelOpen(false)}
          messages={messages}
        />
      </Box>

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
