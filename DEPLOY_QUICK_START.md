# 🚀 Deploy Nhanh ConstructOS

Hướng dẫn deploy nhanh trong 5 phút!

## Yêu Cầu

- Server Linux (Ubuntu/Debian)
- Docker & Docker Compose đã cài đặt
- Domain name (optional)

## Bước 1: Cài Docker (Nếu chưa có)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Logout và login lại** để áp dụng thay đổi.

## Bước 2: Clone Code

```bash
git clone <your-repo-url> constructOS
cd constructOS
```

## Bước 3: Cấu Hình Environment

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa .env với editor
nano .env
```

**Quan trọng**: Cập nhật ít nhất các giá trị sau:

```env
DB_PASSWORD=your_strong_password_here
MYSQL_ROOT_PASSWORD=your_root_password_here
JWT_SECRET=$(openssl rand -base64 32)  # Chạy lệnh này để tạo secret
```

## Bước 4: Deploy

```bash
# Cách 1: Dùng script tự động
./deploy.sh
# Chọn option 3 (Rebuild and start)

# Cách 2: Dùng docker-compose trực tiếp
docker-compose up -d --build
```

## Bước 5: Kiểm Tra

```bash
# Xem status
docker-compose ps

# Xem logs
docker-compose logs -f

# Test API
curl http://localhost:2222/api/health

# Test Frontend
curl http://localhost
```

## Truy Cập Ứng Dụng

- **Frontend**: http://your-server-ip hoặc http://yourdomain.com
- **Backend API**: http://your-server-ip:2222 hoặc http://api.yourdomain.com

## Cấu Hình Domain & SSL (Optional)

Xem hướng dẫn chi tiết trong file `DEPLOYMENT.md`

## Quản Lý

```bash
# Xem logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update code
git pull
docker-compose up -d --build
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL container đang chạy: `docker-compose ps mysql`
- Kiểm tra password trong `.env`

### Port đã được sử dụng
- Đổi port trong `.env`: `BACKEND_PORT=2223` hoặc `FRONTEND_PORT=8080`

### Frontend không load được
- Kiểm tra `VITE_API_URL` trong `.env`
- Rebuild frontend: `docker-compose up -d --build frontend`

## Backup Database

```bash
source .env
docker-compose exec -T mysql mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > backup.sql
```

## Xem Hướng Dẫn Đầy Đủ

Xem file `DEPLOYMENT.md` để biết thêm chi tiết!

---

**Chúc bạn deploy thành công! 🎉**

