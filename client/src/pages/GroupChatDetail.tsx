import { useState, useEffect, useRef, useCallback } from 'react';
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
  const loadingStartTimeRef = useRef<number | null>(null);
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
      loadingStartTimeRef.current = null; // Reset loading start time
      loadGroup(true); // Show loading for initial load
      loadMessages();
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  // Track previous message length to detect new messages
  const prevMessageLengthRef = useRef(0);
  
  useEffect(() => {
    // Skip all auto-scroll when submitting or loading more
    if (isSubmittingRef.current || isLoadingMoreRef.current || isLoading) {
      prevMessageLengthRef.current = messages.length;
      return;
    }
    
    // Only auto-scroll if message count increased (new message received via socket)
    const messageCountIncreased = messages.length > prevMessageLengthRef.current;
    
    if (messageCountIncreased && messages.length > 0) {
      // Only scroll for socket messages (new messages from others)
      // User's own messages are handled in handleSubmit
      const timer = setTimeout(() => {
        // Double check before scrolling
        if (!isSubmittingRef.current && !isLoadingMoreRef.current) {
          scrollToBottom(true);
        }
      }, 100);
      prevMessageLengthRef.current = messages.length;
      return () => clearTimeout(timer);
    }
    
    prevMessageLengthRef.current = messages.length;
  }, [messages.length, isLoading]);

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

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:2222', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    const joinRooms = () => {
      if (socket.connected && id) {
        console.log('Joining rooms for group:', id);
        // Small delay to ensure socket is fully ready
        setTimeout(() => {
          if (socket.connected && id) {
            socket.emit('join-groups');
            socket.emit('join-group', id);
          }
        }, 100);
      }
    };

    socket.on('connect', () => {
      console.log('Socket connected');
      joinRooms();
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      // Socket.io will automatically attempt to reconnect
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      // Rejoin rooms after reconnection
      joinRooms();
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Reconnection failed - max attempts reached');
      // Could show a notification to user here
    });

    // Batch socket message updates to improve performance with multiple users
    let messageBatch: GroupMessage[] = [];
    let batchTimeout: NodeJS.Timeout | null = null;
    
    socket.on('message-received', (data: { groupId: string; message: GroupMessage; senderId?: string }) => {
      if (data.groupId === id) {
        // ALWAYS skip if this is our own message (already in state from handleSubmit)
        const isOwnMessage = data.message.userId === user?.id || data.senderId === user?.id;
        
        // If it's our own message, completely ignore it - it's already in state
        if (isOwnMessage) {
          return; // Don't process own messages from socket
        }
        
        // Add to batch
        messageBatch.push(data.message);
        
        // Clear existing timeout
        if (batchTimeout) {
          clearTimeout(batchTimeout);
        }
        
        // Batch updates to reduce re-renders (wait 50ms to collect multiple messages)
        batchTimeout = setTimeout(() => {
          if (messageBatch.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map(m => m.id));
              const newMessages = messageBatch.filter(m => !existingIds.has(m.id));
              
              if (newMessages.length === 0) {
                return prev;
              }
              
              // Sort by createdAt to maintain order
              const combined = [...prev, ...newMessages].sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
              
              return combined;
            });
            
            // Auto-scroll for messages from others (not when submitting)
            if (!isSubmittingRef.current) {
              requestAnimationFrame(() => {
                scrollToBottom(true);
              });
            }
            
            messageBatch = [];
          }
          batchTimeout = null;
        }, 50);
      }
    });

    socketRef.current = socket;
  };

  const scrollToBottom = useCallback((instant = false) => {
    const messagesContainer = document.querySelector('[data-messages-container]') as HTMLElement;
    if (messagesContainer) {
      // Always use instant scroll for better control
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return;
    }
    
    // Fallback to lastMessageRef if container not found
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: instant ? 'auto' : 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  }, []);

  const loadGroup = async (showLoading = false) => {
    if (!id) {
      if (showLoading) setIsLoading(false);
      return;
    }
    const currentGroupId = id; // Capture current group ID
    if (showLoading) setIsLoading(true);
    try {
      const data = await groupChatsAPI.getGroupById(currentGroupId);
      // Only update if we're still on the same group
      if (id === currentGroupId) {
        setGroup(data);
      }
    } catch (error: any) {
      console.error('Error loading group:', error);
      if (id === currentGroupId) {
        setGroup(null);
      }
    } finally {
      if (showLoading && id === currentGroupId) {
        setIsLoading(false);
      }
    }
  };

  const loadMessages = async () => {
    if (!id) return;
    setIsLoading(true);
    loadingStartTimeRef.current = Date.now();
    const minLoadingTime = 300; // Minimum time to ensure scroll completes (ms)
    
    try {
      const data = await groupChatsAPI.getMessages(id, 50, 0);
      setMessages(data);
      // Check if there are more messages (if we got 50, there might be more)
      setHasMoreMessages(data.length === 50);
      
      // Calculate elapsed time and ensure minimum display time
      const elapsedTime = Date.now() - (loadingStartTimeRef.current || Date.now());
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      // Scroll to bottom first while spinner is still visible
      // Messages are rendered invisibly to calculate scrollHeight
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const messagesContainer = document.querySelector('[data-messages-container]') as HTMLElement;
          if (messagesContainer) {
            // Scroll to bottom immediately while spinner is still showing
            // This happens before messages are visible
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Wait a bit to ensure scroll has completed
            setTimeout(() => {
              // Verify scroll position is at bottom
              const isAtBottom = Math.abs(
                messagesContainer.scrollHeight - messagesContainer.clientHeight - messagesContainer.scrollTop
              ) < 10;
              
              // If not at bottom, try scrolling again
              if (!isAtBottom) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              }
              
              // Wait for remaining time to ensure scroll is complete
              // Then hide loading and show messages (scroll is already at bottom)
              setTimeout(() => {
                setIsLoading(false);
                loadingStartTimeRef.current = null;
              }, remainingTime);
            }, 100); // Small delay to ensure scroll completes
          } else {
            // Fallback if container not found
            setTimeout(() => {
              setIsLoading(false);
              loadingStartTimeRef.current = null;
            }, remainingTime);
          }
        });
      });
    } catch (error: any) {
      console.error('Error loading messages:', error);
      // On error, still ensure minimum display time
      const elapsedTime = Date.now() - (loadingStartTimeRef.current || Date.now());
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      setTimeout(() => {
        setIsLoading(false);
        loadingStartTimeRef.current = null;
      }, remainingTime);
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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);


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

      // Clear input first (before adding message to avoid flicker)
      setContent('');
      setSelectedFiles([]);

      // Get container reference before state update
      const messagesContainer = document.querySelector('[data-messages-container]') as HTMLElement;

      // Add message to state
      setMessages((prev) => [...prev, newMessage]);
      
      // Scroll immediately after state update - use flushSync approach
      // React batches updates, so we need to wait for the next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (messagesContainer) {
            // Scroll instantly to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } else {
            scrollToBottom(true);
          }
          
          // Focus input immediately after scroll
          const textarea = textInputRef.current?.querySelector('textarea') as HTMLTextAreaElement;
          if (textarea) {
            textarea.focus();
          } else if (textInputRef.current) {
            textInputRef.current.focus();
          }
        });
      });
      
      // Emit socket event (backend will broadcast to other members, not to sender)
      if (socketRef.current) {
        socketRef.current.emit('new-message', {
          groupId: id,
          message: newMessage,
        });
      }
      
      // Reset submitting flag - DON'T reload anything
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Không thể gửi tin nhắn');
      isSubmittingRef.current = false;
    }
  };

  const handleDeleteClick = useCallback((messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteConfirmOpen(true);
  }, []);

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

  const handleEditClick = useCallback((messageId: string) => {
    setMessages((prev) => {
      const message = prev.find((m) => m.id === messageId);
      if (message) {
        setEditingMessageId(messageId);
        setEditingContent(message.content);
      }
      return prev;
    });
    setAnchorEl(null);
  }, []);

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

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, messageId: string) => {
    setAnchorEl(event.currentTarget);
    setHoveredMessageId(messageId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setHoveredMessageId(null);
  }, []);

  const handleImageError = useCallback((attachmentId: string) => {
    setImageErrors((prev) => new Set(prev).add(attachmentId));
  }, []);

  const handleMessageHover = useCallback((messageId: string) => {
    setHoveredMessageId(messageId);
  }, []);

  const handleMessageLeave = useCallback(() => {
    setHoveredMessageId(null);
  }, []);

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

  // Don't early return on loading - keep layout stable to prevent header/footer flashing
  // Loading skeleton will be handled inside MessageList component

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: '#f0f2f5', overflow: 'hidden' }}>
      {!group && isLoading ? (
        <LinearProgress />
      ) : group ? (
        <>
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
            isLoading={isLoading}
            onLoadMore={loadMoreMessages}
            isLoadingMoreRef={isLoadingMoreRef}
            isSubmittingRef={isSubmittingRef}
            onMessageHover={handleMessageHover}
            onMessageLeave={handleMessageLeave}
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
        </>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Không tìm thấy nhóm</Typography>
        </Box>
      )}
    </Box>
  );
}
