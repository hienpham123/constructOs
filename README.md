# Web Admin - Quản lý Công ty Xây dựng

Hệ thống quản lý toàn diện cho công ty xây dựng với các tính năng:

- 📊 **Dashboard tổng quan**: Thống kê dự án, nhân sự, thiết bị, vật tư
- 🏗️ **Quản lý dự án**: Theo dõi tiến độ, giai đoạn, bản vẽ, nhật ký công trường
- 📦 **Quản lý vật tư**: Nhập xuất kho, theo dõi tồn kho, đề xuất mua hàng
- 👥 **Quản lý nhân sự**: Danh sách nhân sự, chấm công, phân ca
- 🔧 **Quản lý thiết bị**: Theo dõi sử dụng, lịch bảo trì, trạng thái
- 📄 **Quản lý hợp đồng**: Hợp đồng thi công, cung cấp, dịch vụ
- 📝 **Nhật ký công trường**: Ghi chép công việc hàng ngày

## Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Date Formatting**: date-fns

## Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0

### Nâng cấp Node.js (nếu cần)

Nếu bạn đang dùng Node.js < 18, hãy nâng cấp bằng một trong các cách sau:

**Sử dụng nvm (khuyến nghị):**
```bash
# Cài đặt nvm nếu chưa có
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Cài đặt và sử dụng Node.js 20 LTS
nvm install 20
nvm use 20
```

**Hoặc tải từ nodejs.org:**
- Truy cập https://nodejs.org/
- Tải và cài đặt Node.js 20 LTS

## Cài đặt

### Frontend (Client)

1. Di chuyển vào thư mục client:

```bash
cd client
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Chạy development server:

```bash
npm run dev
```

4. Build cho production:

```bash
npm run build
```

5. Preview production build:

```bash
npm run preview
```

### Backend (Server)

Xem hướng dẫn trong `server/README.md`

## Cấu trúc dự án

```
constructOS/
├── client/             # Frontend application
│   ├── src/
│   │   ├── components/    # Components tái sử dụng
│   │   ├── pages/         # Các trang chính
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── data/          # Mock data
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── server/            # Backend API server
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── models/
    │   └── middleware/
    └── package.json
```

## Tính năng

### Dashboard
- Tổng quan thống kê: dự án, nhân sự, thiết bị, vật tư
- Cảnh báo: vật tư sắp hết, bảo trì quá hạn
- Dự án gần đây
- Nhật ký công trường gần đây
- Lịch bảo trì sắp tới

### Quản lý dự án
- Danh sách dự án với tiến độ
- Chi tiết dự án: thông tin, giai đoạn, checklist, tài liệu
- Theo dõi tiến độ và tài chính

### Quản lý vật tư
- Danh sách vật tư với trạng thái tồn kho
- Lịch sử nhập xuất kho
- Đề xuất mua hàng

### Quản lý nhân sự
- Danh sách nhân sự
- Chấm công
- Phân công dự án

### Quản lý thiết bị
- Danh sách thiết bị
- Lịch sử sử dụng
- Lịch bảo trì

### Quản lý hợp đồng
- Danh sách hợp đồng
- Theo dõi trạng thái

### Nhật ký công trường
- Ghi chép công việc hàng ngày
- Thời tiết, mô tả công việc, vấn đề

## Backend Server

Dự án đã có backend server với Express.js. Để chạy backend:

```bash
cd server
npm install
npm run dev
```

Server sẽ chạy tại `http://localhost:2222`. Xem thêm trong `server/README.md`.

### Cấu hình API URL

Tạo file `.env` trong thư mục gốc:

```
VITE_API_URL=http://localhost:2222/api
```

## Form Management

Tất cả các form đã được refactor để sử dụng `react-hook-form` với validation bằng `zod`:
- MaterialForm
- ProjectForm  
- PersonnelForm

## API Integration

Các stores đã được cập nhật để kết nối với backend API:
- `materialStore` - Kết nối với `/api/materials`
- `projectStore` - Kết nối với `/api/projects`
- `personnelStore` - Kết nối với `/api/personnel`

## Đăng nhập

Hiện tại hệ thống cho phép đăng nhập với bất kỳ email/password nào (mock authentication).

## Phân quyền

Hệ thống hỗ trợ các vai trò:
- `admin`: Quản trị viên
- `project_manager`: Quản lý dự án
- `accountant`: Kế toán
- `warehouse`: Quản kho
- `site_manager`: Chỉ huy trưởng
- `engineer`: Kỹ sư giám sát
- `client`: Khách hàng

## Phát triển tiếp

- [ ] Kết nối với Backend API
- [ ] Upload bản vẽ, tài liệu
- [ ] Barcode/QR code cho vật tư
- [ ] Chấm công GPS
- [ ] Realtime updates với WebSocket
- [ ] Export báo cáo PDF
- [ ] Mobile responsive cho kỹ sư công trường
- [ ] Chat nội bộ
- [ ] AI nhận diện lỗi từ ảnh

## License

MIT

