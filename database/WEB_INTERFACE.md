# Xem MySQL Database Trên Browser

Hướng dẫn setup web interface để xem và quản lý MySQL database trên browser.

## 🚀 Option 1: Adminer (Đơn Giản Nhất - Khuyến Nghị)

Adminer chỉ là 1 file PHP duy nhất, rất dễ setup.

### Cài đặt:

**Bước 1: Cài PHP (nếu chưa có)**

```bash
# macOS
brew install php

# Kiểm tra PHP
php --version
```

**Bước 2: Download Adminer**

```bash
cd /Users/hochihien/Code/constructOS/database
mkdir -p web
cd web

# Download Adminer (chỉ 1 file!)
curl -o adminer.php https://www.adminer.org/latest.php
```

**Bước 3: Chạy PHP Server**

```bash
cd /Users/hochihien/Code/constructOS/database/web
php -S localhost:8080
```

**Bước 4: Mở Browser**

Mở browser và vào: **http://localhost:8080/adminer.php**

**Bước 5: Đăng nhập**

Điền thông tin:
- **System:** MySQL
- **Server:** localhost:3306
- **Username:** constructos_user
- **Password:** constructos123
- **Database:** constructos

Click **"Login"** → Xong! 🎉

---

## 🚀 Option 2: phpMyAdmin (Đầy Đủ Tính Năng)

### Cài đặt với Homebrew:

```bash
# Cài PHP
brew install php

# Cài phpMyAdmin
brew install phpmyadmin

# Hoặc download từ: https://www.phpmyadmin.net/downloads/
```

### Setup nhanh với PHP built-in server:

```bash
# Tải phpMyAdmin
cd /Users/hochihien/Code/constructOS/database
mkdir -p web
cd web
curl -L https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.tar.gz | tar -xz
mv phpMyAdmin-5.2.1-all-languages phpmyadmin
cd phpmyadmin

# Copy config mẫu
cp config.sample.inc.php config.inc.php

# Chạy server
php -S localhost:8080
```

Mở browser: **http://localhost:8080**

---

## 🚀 Option 3: Dùng Docker (Khuyên Dùng - Dễ Nhất)

### Cài đặt Docker Desktop:

Download từ: https://www.docker.com/products/docker-desktop/

### Chạy Adminer với Docker:

```bash
docker run --link mysql:db -p 8080:8080 adminer
```

Mở browser: **http://localhost:8080**

### Hoặc chạy phpMyAdmin với Docker:

```bash
docker run --name phpmyadmin -d -e PMA_HOST=host.docker.internal -e PMA_PORT=3306 -p 8080:80 phpmyadmin/phpmyadmin
```

---

## 📝 Script Tự Động Setup Adminer

Tôi đã tạo script để setup tự động, xem file `database/scripts/setup_adminer.sh`

---

## 🔧 Troubleshooting

### PHP không tìm thấy?
```bash
# macOS - Cài PHP
brew install php

# Kiểm tra
php --version
```

### Port 8080 đã được dùng?
```bash
# Dùng port khác
php -S localhost:8888

# Hoặc tìm port nào đang free
lsof -i :8080
```

### Không kết nối được database?
- Kiểm tra MySQL đang chạy: `brew services list | grep mysql`
- Kiểm tra password trong `.env` file
- Thử kết nối bằng command line trước

---

## 💡 Khuyến Nghị

- **Đơn giản nhất:** Adminer (1 file PHP)
- **Đầy đủ tính năng:** phpMyAdmin
- **Không muốn cài PHP:** Dùng Docker

---

## 📚 Tham Khảo

- Adminer: https://www.adminer.org/
- phpMyAdmin: https://www.phpmyadmin.net/

