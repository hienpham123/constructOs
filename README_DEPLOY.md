# 📦 ConstructOS - Deployment Guide

Tài liệu này hướng dẫn deploy toàn bộ hệ thống ConstructOS lên production.

## 🚀 Quick Start

Để deploy nhanh, xem file: **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)**

## 📚 Tài Liệu Chi Tiết

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Hướng dẫn deploy chi tiết đầy đủ
- **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)** - Hướng dẫn deploy nhanh 5 phút

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────┐
│   Frontend  │  React + Vite + Nginx
│   (Port 80) │
└──────┬──────┘
       │
       │ API Calls
       │
┌──────▼──────┐
│   Backend   │  Express.js + TypeScript
│ (Port 2222) │
└──────┬──────┘
       │
       │ Database Queries
       │
┌──────▼──────┐
│   MySQL     │  MySQL 8.0
│ (Port 3306) │
└─────────────┘
```

## 📋 Các File Quan Trọng

### Docker Files
- `docker-compose.yml` - Cấu hình tất cả services
- `server/Dockerfile` - Dockerfile cho backend
- `client/Dockerfile` - Dockerfile cho frontend
- `client/nginx.conf` - Cấu hình Nginx cho frontend

### Configuration Files
- `.env.example` - Template cho environment variables
- `.env` - File cấu hình thực tế (không commit vào git)

### Scripts
- `deploy.sh` - Script tự động deploy và quản lý

## 🔧 Các Bước Deploy

1. **Chuẩn bị server**
   - Cài Docker & Docker Compose
   - Clone repository

2. **Cấu hình**
   - Copy `.env.example` thành `.env`
   - Cập nhật các giá trị trong `.env`

3. **Deploy**
   ```bash
   docker-compose up -d --build
   ```

4. **Kiểm tra**
   ```bash
   docker-compose ps
   curl http://localhost:2222/api/health
   ```

## 🌐 Cấu Hình Domain

Sau khi deploy thành công, cấu hình domain và SSL:

1. Trỏ DNS về server IP
2. Cài SSL với Let's Encrypt
3. Cập nhật `.env` với domain mới
4. Rebuild services

Xem chi tiết trong `DEPLOYMENT.md`

## 🔒 Security Checklist

- [ ] Đổi tất cả default passwords
- [ ] Tạo JWT_SECRET mạnh
- [ ] Cấu hình firewall
- [ ] Cài SSL certificate
- [ ] Cập nhật CORS_ORIGIN
- [ ] Backup database định kỳ

## 📊 Monitoring

```bash
# Xem logs
docker-compose logs -f

# Xem status
docker-compose ps

# Xem resource usage
docker stats
```

## 💾 Backup

```bash
# Backup database
source .env
docker-compose exec -T mysql mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > backup.sql

# Restore
docker-compose exec -T mysql mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < backup.sql
```

## 🆘 Troubleshooting

Xem phần Troubleshooting trong `DEPLOYMENT.md` hoặc:

```bash
# Xem logs của từng service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Restart service
docker-compose restart backend

# Rebuild service
docker-compose up -d --build backend
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs
2. Kiểm tra environment variables
3. Kiểm tra network connectivity
4. Xem `DEPLOYMENT.md` để biết thêm chi tiết

---

**Happy Deploying! 🎉**

