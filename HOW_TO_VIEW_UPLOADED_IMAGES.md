# 📸 Hướng Dẫn Xem Ảnh Đã Upload

Hướng dẫn xem các ảnh đã upload trong hệ thống ConstructOS.

## 📁 Vị Trí Lưu Trữ Ảnh

### Trên Server (Local Development)

Ảnh được lưu trong thư mục `server/uploads/` với cấu trúc:

```
server/
└── uploads/
    ├── avatars/              # Avatar của users
    ├── transactions/          # Attachments cho material transactions
    ├── comments/             # Attachments cho project comments
    ├── purchase-request-comments/  # Attachments cho purchase request comments
    ├── group-avatars/        # Avatar của group chats
    ├── group-messages/       # Attachments trong group messages
    └── direct-messages/      # Attachments trong direct messages
```

### Trên Render (Production)

Ảnh được lưu trong thư mục `uploads/` trên Render server (tương tự cấu trúc trên).

## 🌐 Cách Truy Cập Ảnh Qua URL

### Local Development

```
http://localhost:2222/uploads/{type}/{filename}
```

Ví dụ:
- Avatar: `http://localhost:2222/uploads/avatars/abc123.jpg`
- Transaction attachment: `http://localhost:2222/uploads/transactions/xyz789.png`

### Production (Render)

```
https://constructos-backend.onrender.com/uploads/{type}/{filename}
```

Ví dụ:
- Avatar: `https://constructos-backend.onrender.com/uploads/avatars/abc123.jpg`
- Transaction attachment: `https://constructos-backend.onrender.com/uploads/transactions/xyz789.png`

## 📋 Các Loại Ảnh và Đường Dẫn

### 1. Avatar của User

**Lưu tại:** `server/uploads/avatars/`

**URL format:**
- Local: `http://localhost:2222/uploads/avatars/{filename}`
- Production: `{API_BASE_URL}/uploads/avatars/{filename}`

**Ví dụ:**
```
http://localhost:2222/uploads/avatars/5a069305-d84c-4579-a58a-309e55760025.jpeg
```

### 2. Transaction Attachments

**Lưu tại:** `server/uploads/transactions/`

**URL format:**
- Local: `http://localhost:2222/uploads/transactions/{filename}`
- Production: `{API_BASE_URL}/uploads/transactions/{filename}`

**Ví dụ:**
```
http://localhost:2222/uploads/transactions/ed404a14-057e-40ac-876b-dfe75d535ca6.jpeg
```

### 3. Project Comment Attachments

**Lưu tại:** `server/uploads/comments/`

**URL format:**
- Local: `http://localhost:2222/uploads/comments/{filename}`
- Production: `{API_BASE_URL}/uploads/comments/{filename}`

### 4. Purchase Request Comment Attachments

**Lưu tại:** `server/uploads/purchase-request-comments/`

**URL format:**
- Local: `http://localhost:2222/uploads/purchase-request-comments/{filename}`
- Production: `{API_BASE_URL}/uploads/purchase-request-comments/{filename}`

### 5. Group Chat Avatars

**Lưu tại:** `server/uploads/group-avatars/`

**URL format:**
- Local: `http://localhost:2222/uploads/group-avatars/{filename}`
- Production: `{API_BASE_URL}/uploads/group-avatars/{filename}`

### 6. Group Message Attachments

**Lưu tại:** `server/uploads/group-messages/`

**URL format:**
- Local: `http://localhost:2222/uploads/group-messages/{filename}`
- Production: `{API_BASE_URL}/uploads/group-messages/{filename}`

### 7. Direct Message Attachments

**Lưu tại:** `server/uploads/direct-messages/`

**URL format:**
- Local: `http://localhost:2222/uploads/direct-messages/{filename}`
- Production: `{API_BASE_URL}/uploads/direct-messages/{filename}`

## 🔍 Cách Tìm Ảnh Đã Upload

### Cách 1: Xem Trong Database

1. **Avatar của user:**
   ```sql
   SELECT id, name, email, avatar FROM users WHERE avatar IS NOT NULL;
   ```
   - Cột `avatar` chứa tên file (ví dụ: `5a069305-d84c-4579-a58a-309e55760025.jpeg`)
   - URL đầy đủ: `{API_BASE_URL}/uploads/avatars/{avatar}`

2. **Transaction attachments:**
   ```sql
   SELECT id, transaction_id, filename, file_url FROM transaction_attachments;
   ```
   - Cột `file_url` chứa URL đầy đủ của ảnh

3. **Project comment attachments:**
   ```sql
   SELECT id, comment_id, filename, file_url FROM comment_attachments;
   ```

### Cách 2: Xem Trong Supabase Table Editor

1. Vào Supabase Dashboard
2. Click **"Table Editor"**
3. Chọn bảng:
   - `users` → xem cột `avatar`
   - `transaction_attachments` → xem cột `file_url`
   - `comment_attachments` → xem cột `file_url`

### Cách 3: Xem Trong Frontend

1. Vào trang profile/user → xem avatar
2. Vào trang material transactions → xem attachments
3. Vào project comments → xem comment attachments

## 🖼️ Xem Ảnh Trực Tiếp

### Trong Browser

1. Copy URL của ảnh (từ database hoặc API response)
2. Paste vào address bar của browser
3. Ảnh sẽ hiển thị trực tiếp

**Ví dụ:**
```
https://constructos-backend.onrender.com/uploads/avatars/5a069305-d84c-4579-a58a-309e55760025.jpeg
```

### Trong Code (Frontend)

Ảnh được tự động hiển thị qua `<img>` tag:

```jsx
<img 
  src={user.avatar || '/default-avatar.png'} 
  alt={user.name}
/>
```

## ⚙️ Cấu Hình API_BASE_URL

Để ảnh hiển thị đúng trên production, cần set `API_BASE_URL` trong Render:

```
API_BASE_URL=https://constructos-backend.onrender.com
```

Nếu không set, ảnh sẽ dùng URL mặc định `http://localhost:2222` và không hiển thị được trên production.

## 📝 Lưu Ý

1. **File naming:** Tất cả file được đổi tên thành UUID để tránh trùng lặp
   - Format: `{uuid}.{extension}`
   - Ví dụ: `5a069305-d84c-4579-a58a-309e55760025.jpeg`

2. **File size limit:**
   - Avatar: 5MB max
   - Transaction attachments: 10MB max
   - Comment attachments: 5MB max

3. **Allowed file types:**
   - Images: JPEG, JPG, PNG, GIF, WEBP
   - Documents: PDF, DOC, DOCX, XLS, XLSX (cho attachments)

4. **Static files serving:**
   - Server tự động serve files qua endpoint `/uploads/`
   - Không cần authentication để xem ảnh (public access)

## 🆘 Troubleshooting

### Ảnh không hiển thị

1. **Kiểm tra URL:**
   - URL có đúng format không?
   - `API_BASE_URL` có được set đúng không?

2. **Kiểm tra file tồn tại:**
   ```bash
   # Local
   ls server/uploads/avatars/
   
   # Render (qua SSH hoặc logs)
   ```

3. **Kiểm tra static files serving:**
   - Server có log: `Serving static files from: /path/to/uploads`?
   - Endpoint `/uploads/` có hoạt động không?

### Ảnh bị 404

- File có thể đã bị xóa
- Đường dẫn không đúng
- Server chưa restart sau khi upload

---

**Tóm lại:** Ảnh được lưu trong `server/uploads/` và truy cập qua URL `{API_BASE_URL}/uploads/{type}/{filename}` 🎉

