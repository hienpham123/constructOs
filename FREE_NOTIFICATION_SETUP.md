# Hướng Dẫn Cấu Hình Thông Báo MIỄN PHÍ VÀ KHÔNG GIỚI HẠN

## ✅ Giải Pháp: Email + In-App Notifications

Hệ thống hỗ trợ **2 phương thức thông báo MIỄN PHÍ và KHÔNG GIỚI HẠN**:

1. **Email** (Gmail/Outlook - FREE, không giới hạn)
2. **In-App Notifications** (WebSocket - FREE, không giới hạn, real-time)

## 🚀 Cài Đặt Nhanh

### Bước 1: Cài Đặt Nodemailer

```bash
cd server
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Bước 2: Cấu Hình Email (Gmail - Miễn Phí)

#### 2.1. Tạo App Password cho Gmail

1. Vào [Google Account](https://myaccount.google.com/)
2. Bật **2-Step Verification** (nếu chưa bật)
3. Tạo **App Password**:
   - Vào **Security** → **2-Step Verification** → **App passwords**
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên: "ConstructOS"
   - Copy password được tạo (16 ký tự)

#### 2.2. Cấu Hình trong `.env`

Thêm vào file `server/.env`:

```env
# Email Configuration (Gmail - FREE, không giới hạn)
EMAIL_SERVICE=gmail
EMAIL_FROM=your-email@gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### Bước 3: Hoàn Tất!

Hệ thống sẽ tự động:
- ✅ Gửi **Email** khi có thông báo
- ✅ Gửi **In-App Notification** (real-time) nếu user đang online
- ✅ Lưu notification vào database để hiển thị sau

## 📧 Các Tùy Chọn Email Khác

### Option 1: Gmail (Khuyến nghị)
- ✅ **FREE hoàn toàn**
- ✅ **Không giới hạn** số lượng email
- ✅ Dễ cấu hình

```env
EMAIL_SERVICE=gmail
EMAIL_FROM=your-email@gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Option 2: Outlook (Miễn phí)
- ✅ **FREE hoàn toàn**
- ✅ **Không giới hạn** số lượng email

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
EMAIL_FROM=your-email@outlook.com
```

### Option 3: SendGrid (Free Tier: 100 emails/ngày)
- ✅ **FREE** 100 emails/ngày
- ✅ Dễ tích hợp

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@yourdomain.com
```

## 🎯 Cách Hoạt Động

### Khi User Được Giao Việc:

1. **Email** được gửi ngay lập tức (nếu đã cấu hình)
2. **In-App Notification** hiển thị real-time nếu user đang online
3. **Lưu vào database** để user xem lại sau

### In-App Notifications:

- ✅ **Real-time** qua WebSocket
- ✅ **FREE hoàn toàn**
- ✅ **Không giới hạn** số lượng
- ✅ Tự động hiển thị khi user online
- ✅ Lưu vào database nếu user offline

## 📊 So Sánh

| Phương Thức | Chi Phí | Giới Hạn | Real-time | Dễ Cấu Hình |
|------------|---------|----------|-----------|-------------|
| **Email (Gmail)** | FREE | Không | ❌ | ⭐⭐⭐⭐⭐ |
| **In-App (WebSocket)** | FREE | Không | ✅ | ⭐⭐⭐⭐⭐ |
| **Zalo OA** | Có phí | Có | ❌ | ⭐⭐⭐ |
| **SMS** | Có phí | Có | ❌ | ⭐⭐ |

## ✅ Kết Quả

- ✅ **MIỄN PHÍ hoàn toàn**
- ✅ **KHÔNG GIỚI HẠN** số lượng thông báo
- ✅ **Real-time** với In-App Notifications
- ✅ **Email** để đảm bảo user nhận được thông báo
- ✅ **Lưu vào database** để xem lại sau

## 🔧 Kiểm Tra

Sau khi cấu hình, test bằng cách:

1. Tạo một task mới và giao cho user
2. Kiểm tra email của user
3. Kiểm tra In-App notification (nếu user đang online)

## 📝 Lưu Ý

- **Email**: Cần cấu hình SMTP để gửi email
- **In-App**: Tự động hoạt động, không cần cấu hình thêm
- **Database**: Tự động tạo bảng `notifications` khi chạy lần đầu

## 🎉 Hoàn Tất!

Bây giờ bạn có hệ thống thông báo **MIỄN PHÍ và KHÔNG GIỚI HẠN**!

