# Hướng dẫn nâng cấp Node.js lên version >= 18

## Kiểm tra phiên bản Node.js hiện tại

```bash
node --version
```

Nếu version < 18, bạn cần nâng cấp.

## Phương pháp 1: Sử dụng nvm (khuyến nghị)

nvm (Node Version Manager) cho phép bạn quản lý nhiều phiên bản Node.js trên cùng một máy.

### Cài đặt nvm

**macOS/Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Sau khi cài đặt, mở lại terminal hoặc chạy:
```bash
source ~/.bashrc
# hoặc
source ~/.zshrc
```

**Windows:**
Tải và cài đặt từ: https://github.com/coreybutler/nvm-windows/releases

### Sử dụng nvm để cài đặt Node.js 20 LTS

```bash
# Cài đặt Node.js 20 LTS
nvm install 20

# Sử dụng Node.js 20
nvm use 20

# Đặt Node.js 20 làm mặc định
nvm alias default 20

# Xác nhận version
node --version  # Nên hiển thị v20.x.x
```

## Phương pháp 2: Cài đặt trực tiếp từ nodejs.org

1. Truy cập https://nodejs.org/
2. Tải và cài đặt Node.js 20 LTS
3. Khởi động lại terminal
4. Kiểm tra version:
```bash
node --version
```

## Sau khi nâng cấp Node.js

1. Xóa node_modules và package-lock.json (nếu cần):
```bash
cd client
rm -rf node_modules package-lock.json
```

2. Cài đặt lại dependencies:
```bash
npm install
```

3. Kiểm tra lại:
```bash
npm run dev
```

## Lưu ý

- Nếu bạn đang dùng nvm, mỗi terminal mới có thể cần chạy `nvm use 20`
- Để tự động sử dụng Node 20, tạo file `.nvmrc` trong thư mục dự án:
```bash
echo "20" > .nvmrc
```
Sau đó chạy `nvm use` sẽ tự động sử dụng version trong file này.

