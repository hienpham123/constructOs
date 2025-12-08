# 🚀 Hướng Dẫn Deploy ConstructOS

Chào mừng bạn đến với hướng dẫn deploy hệ thống ConstructOS! Tôi đã tạo sẵn tất cả các file cần thiết để bạn có thể deploy dự án lên production một cách dễ dàng.

## 📁 Các File Đã Tạo

### 1. Docker Configuration
- ✅ `docker-compose.yml` - File cấu hình chính để chạy tất cả services (MySQL, Backend, Frontend)
- ✅ `server/Dockerfile` - Dockerfile cho backend server
- ✅ `client/Dockerfile` - Dockerfile cho frontend client  
- ✅ `client/nginx.conf` - Cấu hình Nginx cho frontend
- ✅ `.dockerignore` - File loại trừ khi build Docker image

### 2. Environment Configuration
- ✅ `.env.example` - Template cho các biến môi trường
- ⚠️ `.env` - File cấu hình thực tế (bạn cần tạo từ .env.example)

### 3. Documentation
- ✅ `DEPLOYMENT.md` - Hướng dẫn deploy chi tiết đầy đủ
- ✅ `DEPLOY_QUICK_START.md` - Hướng dẫn deploy nhanh 5 phút
- ✅ `README_DEPLOY.md` - Tổng quan về deployment
- ✅ `HUONG_DAN_DEPLOY.md` - File này (hướng dẫn bằng tiếng Việt)

### 4. Scripts
- ✅ `deploy.sh` - Script tự động để deploy và quản lý services

## 🎯 Các Bước Deploy

### Bước 1: Chuẩn Bị Server

Bạn cần một server Linux (Ubuntu/Debian) với:
- Docker đã cài đặt
- Docker Compose đã cài đặt
- Domain name (optional, nhưng khuyến nghị)

### Bước 2: Clone Code Lên Server

```bash
git clone <your-repo-url> constructOS
cd constructOS
```

### Bước 3: Cấu Hình Environment

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa file .env
nano .env
```

**QUAN TRỌNG**: Bạn PHẢI cập nhật các giá trị sau trong file `.env`:

1. **DB_PASSWORD** - Mật khẩu cho database user (phải mạnh!)
2. **MYSQL_ROOT_PASSWORD** - Mật khẩu root cho MySQL (phải mạnh!)
3. **JWT_SECRET** - Secret key cho JWT (tạo bằng: `openssl rand -base64 32`)
4. **API_BASE_URL** - URL của backend (ví dụ: `https://api.yourdomain.com`)
5. **VITE_API_URL** - URL API cho frontend (ví dụ: `https://api.yourdomain.com/api`)
6. **FRONTEND_URL** - URL của frontend (ví dụ: `https://yourdomain.com`)
7. **CORS_ORIGIN** - Domain frontend (ví dụ: `https://yourdomain.com`)

### Bước 4: Deploy

Có 2 cách:

#### Cách 1: Dùng Script Tự Động (Khuyến Nghị)

```bash
./deploy.sh
# Chọn option 3: Rebuild and start services
```

#### Cách 2: Dùng Docker Compose Trực Tiếp

```bash
docker-compose up -d --build
```

### Bước 5: Kiểm Tra

```bash
# Xem status của tất cả services
docker-compose ps

# Xem logs
docker-compose logs -f

# Test API
curl http://localhost:2222/api/health

# Test Frontend  
curl http://localhost
```

## 🌐 Cấu Hình Domain & SSL (Sau Khi Deploy Thành Công)

### 1. Cấu Hình DNS

Thêm các A records vào DNS:
- `yourdomain.com` → IP của server
- `api.yourdomain.com` → IP của server

### 2. Cài SSL với Let's Encrypt

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Tạo SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

### 3. Cập Nhật .env và Rebuild

Sau khi có SSL, cập nhật `.env`:
```env
API_BASE_URL=https://api.yourdomain.com
VITE_API_URL=https://api.yourdomain.com/api
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

Rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

## 🔧 Quản Lý Services

### Xem Logs
```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend

# Chỉ frontend
docker-compose logs -f frontend

# Chỉ database
docker-compose logs -f mysql
```

### Restart Services
```bash
# Restart tất cả
docker-compose restart

# Restart một service
docker-compose restart backend
```

### Stop Services
```bash
docker-compose down
```

### Update Code
```bash
git pull
docker-compose up -d --build
```

## 💾 Backup Database

```bash
# Backup
source .env
docker-compose exec -T mysql mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T mysql mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < backup.sql
```

## 🆘 Troubleshooting

### Lỗi: Database Connection Error

**Nguyên nhân**: MySQL chưa sẵn sàng hoặc sai password

**Giải pháp**:
```bash
# Kiểm tra MySQL container
docker-compose ps mysql

# Kiểm tra logs
docker-compose logs mysql

# Kiểm tra password trong .env
cat .env | grep DB_PASSWORD
```

### Lỗi: Port Already in Use

**Nguyên nhân**: Port đã được sử dụng bởi service khác

**Giải pháp**:
```bash
# Tìm process đang dùng port
sudo lsof -i :2222

# Hoặc đổi port trong .env
BACKEND_PORT=2223
```

### Lỗi: Frontend Không Kết Nối Được Backend

**Nguyên nhân**: CORS hoặc sai API URL

**Giải pháp**:
1. Kiểm tra `VITE_API_URL` trong `.env`
2. Kiểm tra `CORS_ORIGIN` trong `.env`
3. Rebuild frontend: `docker-compose up -d --build frontend`

### Lỗi: Upload Files Không Hoạt Động

**Nguyên nhân**: Thư mục uploads không có quyền write

**Giải pháp**:
```bash
# Kiểm tra quyền
ls -la server/uploads

# Fix quyền (nếu cần)
chmod -R 755 server/uploads
```

## 📊 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────┐
│         Frontend (Nginx)            │
│         Port: 80                    │
│         React + Vite Build          │
└──────────────┬──────────────────────┘
               │
               │ API Calls
               │
┌──────────────▼──────────────────────┐
│      Backend (Express.js)           │
│      Port: 2222                     │
│      TypeScript + Node.js           │
└──────────────┬──────────────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼──────────────────────┐
│         MySQL Database              │
│         Port: 3306                  │
│         MySQL 8.0                   │
└─────────────────────────────────────┘
```

## ✅ Checklist Trước Khi Deploy

- [ ] Đã cài Docker và Docker Compose
- [ ] Đã clone code lên server
- [ ] Đã tạo file `.env` từ `.env.example`
- [ ] Đã cập nhật `DB_PASSWORD` (mật khẩu mạnh)
- [ ] Đã cập nhật `MYSQL_ROOT_PASSWORD` (mật khẩu mạnh)
- [ ] Đã tạo `JWT_SECRET` mạnh (dùng `openssl rand -base64 32`)
- [ ] Đã cập nhật các URL trong `.env` (nếu có domain)
- [ ] Đã kiểm tra firewall (mở port 80, 443, 22)
- [ ] Đã backup database (nếu có dữ liệu cũ)

## 🔒 Security Checklist

- [ ] Đã đổi tất cả default passwords
- [ ] JWT_SECRET là random string mạnh
- [ ] CORS_ORIGIN chỉ chứa domain của bạn (không dùng `*` trong production)
- [ ] Đã cài SSL certificate
- [ ] Đã cấu hình firewall
- [ ] Database user chỉ có quyền cần thiết
- [ ] Đã setup backup tự động

## 📚 Tài Liệu Tham Khảo

- **DEPLOY_QUICK_START.md** - Deploy nhanh trong 5 phút
- **DEPLOYMENT.md** - Hướng dẫn chi tiết đầy đủ
- **README_DEPLOY.md** - Tổng quan về deployment

## 🎉 Hoàn Thành!

Sau khi deploy thành công, bạn có thể:

- Truy cập frontend tại: `http://your-server-ip` hoặc `https://yourdomain.com`
- Truy cập API tại: `http://your-server-ip:2222` hoặc `https://api.yourdomain.com`
- Kiểm tra health: `curl http://your-server-ip:2222/api/health`

**Chúc bạn deploy thành công! 🚀**

Nếu gặp vấn đề, hãy xem phần Troubleshooting hoặc kiểm tra logs của các services.

