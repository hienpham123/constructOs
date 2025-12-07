# Tính năng Group Chat

Tính năng Group Chat đã được tích hợp vào ConstructOS, cho phép người dùng tạo và tham gia các nhóm chat, gửi tin nhắn real-time với file đính kèm.

## Tính năng chính

### 1. Tạo nhóm chat
- User có thể tạo group chat mới
- Đặt tên nhóm
- Chọn ảnh đại diện nhóm (optional)
- Thêm thành viên từ danh sách user

### 2. Quản lý thành viên
- Chủ nhóm (owner) có thể:
  - Thêm thành viên mới
  - Xóa thành viên
  - Chuyển quyền chủ nhóm
- Thành viên có thể rời nhóm

### 3. Giao diện chat
- Gửi text
- Gửi file (doc/pdf/xlsx/image)
- Preview file
- Typing indicator ("user đang nhập...")
- Unread badge cho từng nhóm
- Real-time chat với Socket.io

### 4. Menu
- Mục "Group Chat" trong Sidebar
- Danh sách các nhóm user đang tham gia
- Nút "Tạo nhóm mới"

## Cấu trúc Database

### Tables
1. `group_chats` - Thông tin nhóm chat
2. `group_members` - Thành viên nhóm (với role: owner, admin, member)
3. `group_messages` - Tin nhắn trong nhóm
4. `group_message_attachments` - File đính kèm tin nhắn
5. `group_typing_indicators` - Trạng thái đang nhập (cho real-time)

## API Endpoints

### Groups
- `GET /api/group-chats` - Lấy danh sách nhóm của user
- `GET /api/group-chats/:id` - Lấy thông tin chi tiết nhóm
- `POST /api/group-chats` - Tạo nhóm mới
- `PUT /api/group-chats/:id` - Cập nhật nhóm
- `DELETE /api/group-chats/:id` - Xóa nhóm

### Members
- `POST /api/group-chats/:id/members` - Thêm thành viên
- `DELETE /api/group-chats/:id/members/:memberId` - Xóa thành viên
- `POST /api/group-chats/:id/transfer-ownership` - Chuyển quyền chủ nhóm

### Messages
- `GET /api/group-chats/:id/messages` - Lấy tin nhắn
- `POST /api/group-chats/:id/messages` - Gửi tin nhắn
- `DELETE /api/group-chats/messages/:messageId` - Xóa tin nhắn

## Real-time với Socket.io

### Events từ Client
- `join-groups` - Join tất cả nhóm của user
- `join-group` - Join một nhóm cụ thể
- `leave-group` - Rời nhóm
- `typing-start` - Bắt đầu nhập
- `typing-stop` - Dừng nhập
- `new-message` - Gửi tin nhắn mới

### Events từ Server
- `message-received` - Nhận tin nhắn mới
- `user-typing` - User đang nhập
- `unread-updated` - Cập nhật số tin nhắn chưa đọc

## Cài đặt

### Backend
1. Chạy migration để tạo tables:
```bash
mysql -u constructos_user -p constructos < database/migrations/create_group_chat.sql
```

2. Cài đặt dependencies (đã có):
```bash
cd server
npm install socket.io
```

3. Server tự động khởi tạo Socket.io khi start

### Frontend
1. Cài đặt dependencies (đã có):
```bash
cd client
npm install socket.io-client
```

2. Truy cập `/group-chats` để sử dụng tính năng

## File Structure

### Backend
- `server/src/controllers/groupChatController.ts` - Controller xử lý logic
- `server/src/routes/groupChatRoutes.ts` - Routes định nghĩa endpoints
- `server/src/utils/socket.ts` - Socket.io handler cho real-time

### Frontend
- `client/src/pages/GroupChats.tsx` - Trang danh sách nhóm
- `client/src/pages/GroupChatDetail.tsx` - Trang chat chi tiết
- `client/src/components/groupChat/CreateGroupDialog.tsx` - Dialog tạo nhóm
- `client/src/services/api/groupChats.ts` - API service

## Lưu ý

1. **Authentication**: Tất cả endpoints yêu cầu authentication token
2. **File Upload**: Giới hạn 10MB cho mỗi file, 5MB cho avatar nhóm
3. **Real-time**: Socket.io yêu cầu token trong auth để xác thực
4. **Permissions**: 
   - Chỉ owner mới có thể xóa nhóm
   - Owner và admin có thể thêm/xóa thành viên
   - Mọi thành viên đều có thể gửi tin nhắn

## Tính năng chưa implement

- [ ] Mention (@someone) trong tin nhắn
- [ ] Edit message (hiện chỉ có delete)
- [ ] Read receipts (đã đọc/chưa đọc)
- [ ] Search messages trong nhóm
- [ ] Pin messages
- [ ] Group settings (mute notifications, etc.)

