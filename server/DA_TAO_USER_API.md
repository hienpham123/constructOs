# ✅ Đã Tạo User API

## 🔧 Vấn Đề

Bạn tạo user trên frontend nhưng không thấy trong database vì **chưa có API endpoint** để tạo user!

## ✅ Giải Pháp

Đã tạo đầy đủ User API:

### 1. User Controller (`server/src/controllers/userController.ts`)
- `getUsers()` - Lấy danh sách users
- `getUserById()` - Lấy user theo ID
- `createUser()` - Tạo user mới (có hash password)
- `updateUser()` - Cập nhật user
- `deleteUser()` - Xóa user

### 2. User Routes (`server/src/routes/userRoutes.ts`)
- `GET /api/users` - Lấy tất cả users
- `GET /api/users/:id` - Lấy user theo ID
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### 3. Đã Tích Hợp Vào Server
- Routes đã được thêm vào `server/src/index.ts`
- API client đã được cập nhật trong `client/src/services/api.ts`

## 📝 API Endpoints

### Tạo User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0900000000",
  "password": "password123",
  "role": "client",
  "status": "active"
}
```

### Lấy Tất Cả Users
```bash
GET /api/users
```

### Lấy User Theo ID
```bash
GET /api/users/:id
```

### Cập Nhật User
```bash
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Nguyễn Văn B",
  "email": "newemail@example.com",
  "role": "admin"
}
```

### Xóa User
```bash
DELETE /api/users/:id
```

## 🔒 Bảo Mật

- Password được hash bằng `bcryptjs` (10 salt rounds)
- Không trả về `password_hash` trong response
- Email phải unique (không trùng lặp)

## 🧪 Test

### 1. Restart Server
```bash
cd server
npm run dev
```

### 2. Test Tạo User (curl)
```bash
curl -X POST http://localhost:2222/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0900000000",
    "password": "password123",
    "role": "client"
  }'
```

### 3. Kiểm Tra Trong phpMyAdmin
1. Mở http://localhost:8080
2. Chọn database `constructos`
3. Chọn table `users`
4. Click tab "Browse"
5. **Sẽ thấy user vừa tạo!** ✅

## 📋 Frontend Integration

API client đã được cập nhật:

```typescript
import { usersAPI } from './services/api';

// Tạo user
const newUser = await usersAPI.create({
  name: "Nguyễn Văn A",
  email: "user@example.com",
  phone: "0900000000",
  password: "password123",
  role: "client"
});

// Lấy tất cả users
const users = await usersAPI.getAll();

// Cập nhật user
await usersAPI.update(userId, { name: "New Name" });

// Xóa user
await usersAPI.delete(userId);
```

## ⚠️ Lưu Ý

1. **Password**: Phải cung cấp `password` hoặc `password_hash`
2. **Email**: Phải unique, không được trùng
3. **Role**: Mặc định là `'client'` nếu không cung cấp
4. **Status**: Mặc định là `'active'` nếu không cung cấp

---

**Bây giờ hãy restart server và test lại! User sẽ được lưu vào MySQL database.**

