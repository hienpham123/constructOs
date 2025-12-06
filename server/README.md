# ConstructOS Backend Server

Backend server cho ứng dụng ConstructOS được xây dựng với Express.js và TypeScript.

## ⚠️ LƯU Ý QUAN TRỌNG

**Server được viết bằng TypeScript, KHÔNG chạy trực tiếp bằng `node index.js`!**

## Cài đặt

```bash
cd server
npm install
```

## Chạy Server

### ✅ Development mode (với hot reload) - KHUYẾN NGHỊ

```bash
npm run dev
```

Lệnh này sẽ:
- Tự động compile TypeScript
- Chạy server với hot reload
- Restart tự động khi code thay đổi

Server sẽ chạy tại `http://localhost:2222` (mặc định)

### Production mode

```bash
# Bước 1: Build TypeScript thành JavaScript
npm run build

# Bước 2: Chạy file đã build
npm start
```

## ❌ CÁC LỖI THƯỜNG GẶP

### Lỗi: "Cannot find module '/path/to/index.js'"

**Nguyên nhân**: Bạn đang cố chạy `node index.js` trực tiếp

**Giải pháp**: Sử dụng `npm run dev` thay vì `node index.js`

```bash
# ❌ SAI
node index.js

# ✅ ĐÚNG
npm run dev
```

### Lỗi: "EADDRINUSE: address already in use :::2222"

**Nguyên nhân**: Port 2222 đã được sử dụng bởi một process khác

**Giải pháp**:

```bash
# Cách 1: Dùng script tự động (khuyến nghị)
./fix-port.sh

# Cách 2: Kill thủ công
lsof -ti:2222 | xargs kill -9

# Cách 3: Đổi port
PORT=3001 npm run dev
```

Sau đó chạy lại `npm run dev`

### Lỗi về module resolution

Nếu gặp lỗi về imports, đảm bảo:
1. Đã cài đặt đầy đủ dependencies: `npm install`
2. Node.js version >= 18
3. Đang ở đúng thư mục `server/`

## API Endpoints

### Health Check
- `GET /api/health` - Kiểm tra server đang chạy

### Materials
- `GET /api/materials` - Lấy danh sách vật tư
- `GET /api/materials/:id` - Lấy chi tiết vật tư
- `POST /api/materials` - Tạo vật tư mới
- `PUT /api/materials/:id` - Cập nhật vật tư
- `DELETE /api/materials/:id` - Xóa vật tư
- `GET /api/materials/transactions/list` - Lấy danh sách giao dịch
- `POST /api/materials/transactions` - Tạo giao dịch mới
- `GET /api/materials/purchase-requests/list` - Lấy danh sách yêu cầu mua hàng
- `POST /api/materials/purchase-requests` - Tạo yêu cầu mua hàng
- `PUT /api/materials/purchase-requests/:id` - Cập nhật yêu cầu mua hàng

### Projects
- `GET /api/projects` - Lấy danh sách dự án
- `GET /api/projects/:id` - Lấy chi tiết dự án
- `POST /api/projects` - Tạo dự án mới
- `PUT /api/projects/:id` - Cập nhật dự án
- `DELETE /api/projects/:id` - Xóa dự án

### Personnel
- `GET /api/personnel` - Lấy danh sách nhân sự
- `GET /api/personnel/:id` - Lấy chi tiết nhân sự
- `POST /api/personnel` - Tạo nhân sự mới
- `PUT /api/personnel/:id` - Cập nhật nhân sự
- `DELETE /api/personnel/:id` - Xóa nhân sự

### Equipment
- `GET /api/equipment` - Lấy danh sách thiết bị
- `GET /api/equipment/:id` - Lấy chi tiết thiết bị
- `POST /api/equipment` - Tạo thiết bị mới
- `PUT /api/equipment/:id` - Cập nhật thiết bị
- `DELETE /api/equipment/:id` - Xóa thiết bị
- `GET /api/equipment/usage/list` - Lấy danh sách sử dụng thiết bị (có thể filter theo equipmentId)
- `POST /api/equipment/usage` - Tạo bản ghi sử dụng thiết bị
- `GET /api/equipment/maintenance/list` - Lấy danh sách lịch bảo trì (có thể filter theo equipmentId)
- `POST /api/equipment/maintenance` - Tạo lịch bảo trì
- `PUT /api/equipment/maintenance/:id` - Cập nhật lịch bảo trì

### Contracts
- `GET /api/contracts` - Lấy danh sách hợp đồng
- `GET /api/contracts/:id` - Lấy chi tiết hợp đồng
- `POST /api/contracts` - Tạo hợp đồng mới
- `PUT /api/contracts/:id` - Cập nhật hợp đồng
- `DELETE /api/contracts/:id` - Xóa hợp đồng

### Site Logs
- `GET /api/site-logs` - Lấy danh sách nhật ký công trường (có thể filter theo projectId)
- `GET /api/site-logs/:id` - Lấy chi tiết nhật ký công trường
- `POST /api/site-logs` - Tạo nhật ký công trường mới
- `PUT /api/site-logs/:id` - Cập nhật nhật ký công trường
- `DELETE /api/site-logs/:id` - Xóa nhật ký công trường

### Auth
- `POST /api/auth/login` - Đăng nhập

## Lưu ý

- Hiện tại server sử dụng in-memory storage. Dữ liệu sẽ mất khi restart server.
- Trong production, nên kết nối với database (PostgreSQL, MongoDB, etc.)
- File chính của server là `src/index.ts`, không phải `index.js`
