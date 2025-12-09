import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useAuthStore } from '../stores/authStore';
import { getFileIcon, isImageFile, formatFileSize } from '../utils/fileHelpers';
import DirectChatHeader from '../components/directMessage/DirectChatHeader';
import DirectMessageList from '../components/directMessage/DirectMessageList';
import DirectMessageInput from '../components/directMessage/DirectMessageInput';
import MessageEditBar from '../components/directMessage/MessageEditBar';
import DeleteMessageDialog from '../components/directMessage/DeleteMessageDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  directMessagesAPI,
  type DirectConversationDetail,
  type DirectMessage,
} from '../services/api/directMessages';
import { useDirectMessageSocket } from '../hooks/useDirectMessageSocket';

export default function DirectChatDetail() {
  const { conversationId, userId } = useParams<{ conversationId?: string; userId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [conversation, setConversation] = useState<DirectConversationDetail | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [content, setContent] = useState('');
  
  // Stable reference for content change handler to prevent re-renders
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);
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
  const [deleteConversationOpen, setDeleteConversationOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const editingMessageRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    // Reset all states first when switching conversations/users
    setMessages([]);
    setConversation(null);
    setContent('');
    setSelectedFiles([]);
    setHasMoreMessages(true);
    setIsLoading(true);
    loadingStartTimeRef.current = null; // Reset loading start time
    setEditingMessageId(null);
    setEditingContent('');

    if (conversationId) {
      // Existing conversation - load conversation and messages
      loadConversation(true); // Show loading for initial load
      loadMessages();
    } else if (userId) {
      // New conversation - load user info to display
      loadConversationByUserId(userId);
      // No messages to load for new conversation
      setMessages([]);
      setIsLoading(false);
    } else {
      // No conversation or user selected - reset to empty state
      setIsLoading(false);
    }
  }, [conversationId, userId]);

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

  const scrollToBottom = useCallback((instant = false) => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: instant ? 'auto' : 'smooth',
        block: 'end',
        inline: 'nearest',
      });
      return;
    }
    
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
  }, []);

  // Batch socket message updates
  const messageBatchRef = useRef<DirectMessage[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle message received from socket
  const handleMessageReceived = useCallback((data: { conversationId: string; message: DirectMessage; senderId?: string }) => {
    const currentConvId = conversationId || conversation?.id;
    if (data.conversationId === currentConvId) {
      // ALWAYS skip if this is our own message (already in state from handleSubmit)
      // Check by comparing senderId with current user
      const isOwnMessage = data.message.senderId === user?.id || data.senderId === user?.id;
      
      // If it's our own message, completely ignore it - don't process at all
      if (isOwnMessage) {
        return; // Early return - don't add duplicate
      }
      
      // Add to batch
      messageBatchRef.current.push(data.message);
      
      // Clear existing timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      
      // Batch updates to reduce re-renders (wait 50ms to collect multiple messages)
      batchTimeoutRef.current = setTimeout(() => {
        if (messageBatchRef.current.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = messageBatchRef.current.filter(m => !existingIds.has(m.id));
            
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
          
          messageBatchRef.current = [];
        }
        batchTimeoutRef.current = null;
      }, 50);
    }
  }, [conversationId, conversation, user?.id, scrollToBottom]);

  // Setup socket connection
  useDirectMessageSocket({
    conversationId: conversationId || conversation?.id || null,
    onMessageReceived: handleMessageReceived,
  });

  const loadConversation = async (showLoading = false) => {
    if (!conversationId) {
      if (showLoading) setIsLoading(false);
      return;
    }
    const currentConvId = conversationId; // Capture current conversationId
    if (showLoading) setIsLoading(true);
    try {
      const data = await directMessagesAPI.getConversation(currentConvId);
      // Only update if we're still on the same conversation
      if (conversationId === currentConvId) {
        setConversation(data);
      }
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      if (conversationId === currentConvId) {
        setConversation(null);
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const loadConversationByUserId = async (otherUserId: string) => {
    try {
      // Get user info
      const { usersAPI } = await import('../services/api/users');
      const userData = await usersAPI.getById(otherUserId);
      
      // Only update if we're still on the same user
      if (userId === otherUserId) {
        // Create a temporary conversation object for display
        setConversation({
          id: '', // Will be created when first message is sent
          otherUser: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar || null,
            status: userData.status,
          },
          lastReadAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error('Error loading user:', error);
      setConversation(null);
      navigate('/chats');
    }
  };

  const loadMessages = async () => {
    // Only load if we have a conversationId (existing conversation)
    if (!conversationId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    loadingStartTimeRef.current = Date.now();
    const minLoadingTime = 300; // Minimum time to ensure scroll completes (ms)
    const currentConvId = conversationId; // Capture current conversationId
    try {
      const data = await directMessagesAPI.getMessages(currentConvId, 50, 0);
      // Only update if we're still on the same conversation
      if (conversationId === currentConvId) {
        setMessages(data);
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
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      if (conversationId === currentConvId) {
        setMessages([]);
        // On error, still ensure minimum display time
        const elapsedTime = Date.now() - (loadingStartTimeRef.current || Date.now());
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        setTimeout(() => {
          setIsLoading(false);
          loadingStartTimeRef.current = null;
        }, remainingTime);
      }
    }
  };

  const loadMoreMessages = async () => {
    // Only load more if we have a conversationId (existing conversation)
    if (!conversationId || isLoadingMore || !hasMoreMessages) return;
    
    setIsLoadingMore(true);
    isLoadingMoreRef.current = true;
    const currentConvId = conversationId; // Capture current conversationId
    
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
      const data = await directMessagesAPI.getMessages(currentConvId, 50, currentOffset);
      
      // Only update if we're still on the same conversation
      if (conversationId !== currentConvId) {
        setIsLoadingMore(false);
        isLoadingMoreRef.current = false;
        return;
      }
      
      if (data.length === 0) {
        setHasMoreMessages(false);
      } else {
        // Prepend older messages to the beginning
        setMessages((prev) => [...data, ...prev]);
        
        // Restore scroll position after new messages are added
        // Wait for React to update DOM, then restore scroll position
        setTimeout(() => {
          if (messagesContainer && conversationId === currentConvId) {
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
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    
    if (!content && selectedFiles.length === 0) {
      return;
    }

    if (!user || !conversation) {
      return;
    }

    // Create temporary message with 'sending' status
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const tempMessage: DirectMessage = {
      id: tempId,
      conversationId: conversation.id || '',
      senderId: user.id,
      receiverId: conversation.otherUser.id,
      senderName: user.name || user.email || 'Bạn',
      senderAvatar: user.avatar || null,
      content: content || '',
      attachments: selectedFiles.map((file, index) => ({
        id: `temp-attach-${tempId}-${index}`,
        messageId: tempId,
        filename: file.name,
        originalFilename: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
        createdAt: now,
      })),
      createdAt: now,
      updatedAt: now,
      status: 'sending',
    };

    // Clear input first
    const messageContent = content;
    const messageFiles = [...selectedFiles];
    setContent('');
    setSelectedFiles([]);

    // Get container reference before state update
    const messagesContainer = document.querySelector('[data-messages-container]') as HTMLElement;

    // Add temporary message to state immediately
    setMessages((prev) => [...prev, tempMessage]);
    
    // Scroll immediately after state update - use single requestAnimationFrame
    requestAnimationFrame(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        scrollToBottom(true);
      }
      
      // Focus input after scroll
      setTimeout(() => {
        const textarea = textInputRef.current?.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        } else if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 0);
    });

    isSubmittingRef.current = true;
    try {
      const newMessage = await directMessagesAPI.sendMessage(
        conversation.otherUser.id,
        {
          content: messageContent || '',
          files: messageFiles.length > 0 ? messageFiles : undefined,
        }
      );

      // If this was a new conversation (no conversationId), navigate to the new conversation
      if (!conversationId && userId) {
        navigate(`/chats/direct/${newMessage.conversationId}`);
        return;
      }

      // Update conversation with new ID if it was created (without loading)
      if (!conversation.id && newMessage.conversationId) {
        // Just update the ID, don't load full conversation to avoid re-render
        setConversation((prev) => prev ? { ...prev, id: newMessage.conversationId } : null);
      }

      // Replace temporary message with real message (status will be 'sent' by default)
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === tempId 
            ? { ...newMessage, status: 'sent' as const }
            : msg
        )
      );
      
      // Reset submitting flag
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Update message status to 'failed'
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === tempId 
            ? { ...msg, status: 'failed' as const }
            : msg
        )
      );
      
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
      await directMessagesAPI.deleteMessage(messageToDelete);
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
    if (!editingMessageId || !editingContent.trim()) {
      handleEditCancel();
      return;
    }

    try {
      const updatedMessage = await directMessagesAPI.updateMessage(editingMessageId, editingContent);
      setMessages((prev) =>
        prev.map((m) => (m.id === editingMessageId ? updatedMessage : m))
      );
      setEditingMessageId(null);
      setEditingContent('');
    } catch (error: any) {
      console.error('Error updating message:', error);
      alert(error.response?.data?.error || 'Không thể cập nhật tin nhắn');
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversation || !conversation.id) return;

    try {
      await directMessagesAPI.deleteConversation(conversation.id);
      navigate('/chats');
      setDeleteConversationOpen(false);
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      alert(error.response?.data?.error || 'Không thể xóa cuộc trò chuyện');
    }
  };

  // Don't early return on loading - keep layout stable to prevent header/footer flashing
  // Loading skeleton will be handled inside DirectMessageList component

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        bgcolor: '#f0f2f5',
        overflow: 'hidden',
      }}
    >
      {isLoading && !conversation ? (
        <LinearProgress />
      ) : conversation || userId ? (
        <>
          <DirectChatHeader
        conversation={conversation}
        onDeleteConversation={() => setDeleteConversationOpen(true)}
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <DirectMessageList
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
          onMessageHover={setHoveredMessageId}
          onMessageLeave={() => setHoveredMessageId(null)}
          onMenuClick={(e, messageId) => {
            setAnchorEl(e.currentTarget);
            setHoveredMessageId(messageId);
          }}
          onMenuClose={() => setAnchorEl(null)}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onImageError={(attachmentId) => {
            setImageErrors((prev) => new Set(prev).add(attachmentId));
          }}
          getFileIcon={getFileIcon}
          isImageFile={isImageFile}
          formatFileSize={formatFileSize}
        />
      </Box>

      {editingMessageId && conversation && (
        <Box sx={{ flexShrink: 0 }}>
          <MessageEditBar
            content={editingContent}
            onContentChange={setEditingContent}
            onSave={handleEditSave}
            onCancel={handleEditCancel}
          />
        </Box>
      )}

      {conversation && !editingMessageId && (
        <Box sx={{ flexShrink: 0 }}>
          <DirectMessageInput
            otherUserName={conversation.otherUser.name}
            content={content}
            selectedFiles={selectedFiles}
            textInputRef={textInputRef}
            imageInputRef={imageInputRef}
            fileInputRef={fileInputRef}
            onContentChange={handleContentChange}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onSubmit={handleSubmit}
          />
        </Box>
      )}

      <DeleteMessageDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setMessageToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={deleteConversationOpen}
        onClose={() => setDeleteConversationOpen(false)}
        onConfirm={handleDeleteConversation}
        title="Xóa cuộc trò chuyện"
        message="Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
        confirmButtonColor="error"
      />
        </>
      ) : !userId ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography>Không tìm thấy cuộc trò chuyện</Typography>
        </Box>
      ) : null}
    </Box>
  );
}

