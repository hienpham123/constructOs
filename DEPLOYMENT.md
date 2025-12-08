# 🚀 Hướng Dẫn Deploy ConstructOS

Hướng dẫn chi tiết để deploy toàn bộ hệ thống ConstructOS (Frontend, Backend, Database) lên production.

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Chuẩn Bị](#chuẩn-bị)
3. [Deploy với Docker (Khuyến Nghị)](#deploy-với-docker-khuyến-nghị)
4. [Deploy Manual (Không dùng Docker)](#deploy-manual-không-dùng-docker)
5. [Cấu Hình Domain & SSL](#cấu-hình-domain--ssl)
6. [Kiểm Tra & Troubleshooting](#kiểm-tra--troubleshooting)

---

## Yêu Cầu Hệ Thống

### Server Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ (hoặc bất kỳ Linux distro nào)
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **CPU**: 2 cores trở lên
- **Disk**: Tối thiểu 20GB trống
- **Network**: Có thể truy cập internet

### Software Requirements

- **Docker** (khuyến nghị): Docker 20.10+ và Docker Compose 2.0+
- **Hoặc**:
  - Node.js 20.x LTS
  - MySQL 8.0+
  - Nginx (cho frontend)

---

## Chuẩn Bị

### 1. Clone Repository

```bash
git clone <your-repo-url> constructOS
cd constructOS
```

### 2. Tạo File Environment

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa với editor của bạn
nano .env
# hoặc
vim .env
```

**Quan trọng**: Cập nhật các giá trị sau trong file `.env`:

- `DB_PASSWORD`: Mật khẩu mạnh cho database user
- `MYSQL_ROOT_PASSWORD`: Mật khẩu root cho MySQL
- `JWT_SECRET`: Tạo secret key mạnh (dùng lệnh: `openssl rand -base64 32`)
- `API_BASE_URL`: URL của backend API (ví dụ: `https://api.yourdomain.com`)
- `VITE_API_URL`: URL API cho frontend (ví dụ: `https://api.yourdomain.com/api`)
- `FRONTEND_URL`: URL của frontend (ví dụ: `https://yourdomain.com`)
- `CORS_ORIGIN`: Domain frontend (ví dụ: `https://yourdomain.com`)

---

## Deploy với Docker (Khuyến Nghị)

### Bước 1: Cài Đặt Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout và login lại để áp dụng group changes
```

### Bước 2: Build và Chạy Services

```bash
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Kiểm tra status
docker-compose ps
```

### Bước 3: Kiểm Tra Services

```bash
# Kiểm tra database
docker-compose exec mysql mysql -u constructos_user -p${DB_PASSWORD} -e "SHOW DATABASES;"

# Kiểm tra backend health
curl http://localhost:2222/api/health

# Kiểm tra frontend
curl http://localhost
```

### Bước 4: Import Database Schema (Nếu chưa tự động)

Nếu database chưa được tạo tự động:

```bash
# Copy schema vào container và chạy
docker-compose exec mysql mysql -u constructos_user -p${DB_PASSWORD} constructOS < database/mysql_schema.sql

# Import initial data (optional)
docker-compose exec mysql mysql -u constructos_user -p${DB_PASSWORD} constructOS < database/seeds/initial_data.sql
```

### Quản Lý Services

```bash
# Stop tất cả
docker-compose down

# Stop và xóa volumes (CẨN THẬN: sẽ mất dữ liệu!)
docker-compose down -v

# Restart một service
docker-compose restart backend

# Xem logs của một service
docker-compose logs -f backend

# Update code và rebuild
git pull
docker-compose up -d --build
```

---

## Deploy Manual (Không dùng Docker)

### Bước 1: Cài Đặt MySQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server -y

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL
sudo mysql_secure_installation
```

### Bước 2: Setup Database

```bash
# Login MySQL
sudo mysql -u root -p

# Tạo database và user
CREATE DATABASE constructOS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON constructOS.* TO 'constructos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u constructos_user -p constructOS < database/mysql_schema.sql

# Import initial data (optional)
mysql -u constructos_user -p constructOS < database/seeds/initial_data.sql
```

### Bước 3: Setup Backend

```bash
cd server

# Cài dependencies
npm install --production

# Tạo file .env
cp env.example.txt .env
nano .env  # Cập nhật các giá trị

# Build
npm run build

# Test
npm start
```

### Bước 4: Setup Backend với PM2 (Process Manager)

```bash
# Cài PM2
npm install -g pm2

# Start backend với PM2
cd server
pm2 start dist/index.js --name constructos-backend

# Save PM2 config
pm2 save
pm2 startup  # Follow instructions

# Xem logs
pm2 logs constructos-backend
```

### Bước 5: Setup Frontend

```bash
cd client

# Cài dependencies
npm install

# Tạo file .env
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env

# Build
npm run build

# Build sẽ tạo thư mục dist/
```

### Bước 6: Setup Nginx cho Frontend

```bash
# Cài Nginx
sudo apt install nginx -y

# Copy config
sudo cp client/nginx.conf /etc/nginx/sites-available/constructos
sudo ln -s /etc/nginx/sites-available/constructos /etc/nginx/sites-enabled/

# Copy build files
sudo cp -r client/dist/* /var/www/constructos/

# Test và reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 7: Setup Nginx Reverse Proxy cho Backend

Tạo file `/etc/nginx/sites-available/constructos-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:2222;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/constructos-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Cấu Hình Domain & SSL

### 1. Cấu Hình DNS

Thêm các A records vào DNS của domain:

```
yourdomain.com        -> IP_SERVER
api.yourdomain.com    -> IP_SERVER
www.yourdomain.com    -> IP_SERVER (optional)
```

### 2. Cài Đặt SSL với Let's Encrypt

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Tạo SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Cập Nhật Environment Variables

Sau khi có SSL, cập nhật `.env`:

```env
API_BASE_URL=https://api.yourdomain.com
VITE_API_URL=https://api.yourdomain.com/api
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

Rebuild và restart:

```bash
# Với Docker
docker-compose down
docker-compose up -d --build

# Với Manual
cd client && npm run build
sudo systemctl reload nginx
pm2 restart constructos-backend
```

---

## Kiểm Tra & Troubleshooting

### Kiểm Tra Services

```bash
# Với Docker
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Với Manual
pm2 status
pm2 logs constructos-backend
sudo systemctl status nginx
sudo systemctl status mysql
```

### Kiểm Tra Database Connection

```bash
# Với Docker
docker-compose exec mysql mysql -u constructos_user -p constructOS -e "SELECT COUNT(*) FROM users;"

# Với Manual
mysql -u constructos_user -p constructOS -e "SELECT COUNT(*) FROM users;"
```

### Kiểm Tra API

```bash
# Health check
curl http://localhost:2222/api/health

# Test authentication
curl -X POST http://localhost:2222/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Common Issues

#### 1. Database Connection Error

**Lỗi**: `Can't connect to MySQL server`

**Giải pháp**:
- Kiểm tra MySQL đang chạy: `sudo systemctl status mysql`
- Kiểm tra credentials trong `.env`
- Kiểm tra firewall: `sudo ufw allow 3306`

#### 2. Port Already in Use

**Lỗi**: `Port 2222 is already in use`

**Giải pháp**:
```bash
# Tìm process đang dùng port
sudo lsof -i :2222
# Kill process
sudo kill -9 <PID>
```

#### 3. Frontend không kết nối được Backend

**Lỗi**: CORS error hoặc API không response

**Giải pháp**:
- Kiểm tra `VITE_API_URL` trong `.env` của client
- Kiểm tra `CORS_ORIGIN` trong `.env` của server
- Rebuild frontend sau khi thay đổi `.env`

#### 4. Upload Files không hoạt động

**Lỗi**: Không upload được file

**Giải pháp**:
- Kiểm tra thư mục `server/uploads` có quyền write
- Với Docker: kiểm tra volume mount
- Với Manual: `sudo chmod -R 755 server/uploads`

### Backup Database

```bash
# Với Docker
docker-compose exec mysql mysqldump -u constructos_user -p${DB_PASSWORD} constructOS > backup_$(date +%Y%m%d).sql

# Với Manual
mysqldump -u constructos_user -p constructOS > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
# Với Docker
docker-compose exec -T mysql mysql -u constructos_user -p${DB_PASSWORD} constructOS < backup_20231201.sql

# Với Manual
mysql -u constructos_user -p constructOS < backup_20231201.sql
```

---

## Monitoring & Maintenance

### Logs

```bash
# Docker logs
docker-compose logs -f --tail=100

# PM2 logs
pm2 logs constructos-backend --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance Monitoring

Cài đặt monitoring tools (optional):

```bash
# PM2 monitoring
pm2 monit

# Docker stats
docker stats
```

### Auto-restart on Reboot

**Với Docker**: Docker tự động restart containers nếu server reboot (với `restart: unless-stopped`)

**Với Manual**: PM2 đã được setup với `pm2 startup`

---

## Security Checklist

- [ ] Đổi tất cả default passwords
- [ ] Tạo JWT_SECRET mạnh và unique
- [ ] Cấu hình firewall (chỉ mở port 80, 443, 22)
- [ ] Cài SSL certificate
- [ ] Cập nhật CORS_ORIGIN với domain chính xác
- [ ] Backup database định kỳ
- [ ] Cập nhật dependencies thường xuyên
- [ ] Giới hạn quyền truy cập database user
- [ ] Sử dụng environment variables, không hardcode secrets

---

## Support

Nếu gặp vấn đề, kiểm tra:
1. Logs của các services
2. Network connectivity
3. Environment variables
4. File permissions
5. Database connection

---

**Chúc bạn deploy thành công! 🎉**

