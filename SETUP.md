# Hướng dẫn Setup Dự án

## Bước 1: Nâng cấp Node.js lên >= 18

Bạn đang dùng Node.js v16.20.2. Cần nâng cấp lên >= 18.

### Sử dụng nvm (đã được cài đặt):

```bash
# Cài đặt Node.js 20 LTS
nvm install 20

# Sử dụng Node.js 20
nvm use 20

# Đặt làm mặc định
nvm alias default 20

# Kiểm tra version
node --version  # Nên hiển thị v20.x.x
```

## Bước 2: Cài đặt Dependencies

### Cài đặt dependencies cho root (concurrently để chạy cả client và server):

```bash
npm install
```

### Cài đặt dependencies cho Client (Frontend):

```bash
cd client
npm install
cd ..
```

### Cài đặt dependencies cho Server (Backend):

```bash
cd server
npm install
cd ..
```

Hoặc chạy tất cả cùng lúc từ root:

```bash
npm run install:all
```

## Bước 3: Chạy ứng dụng

### Chạy cả Client và Server cùng lúc:

```bash
npm run dev
```

### Hoặc chạy riêng lẻ:

**Client (Frontend):**
```bash
npm run dev:client
# Hoặc
cd client && npm run dev
```

**Server (Backend):**
```bash
npm run dev:server
# Hoặc
cd server && npm run dev
```

## Cấu trúc dự án sau khi di chuyển:

```
constructOS/
├── client/          # Frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   └── ...
├── server/          # Backend (Express.js)
│   ├── src/
│   ├── package.json
│   └── ...
├── package.json     # Root package.json với scripts để chạy cả hai
└── README.md
```

## Lưu ý

- Client chạy tại: http://localhost:2025
- Server chạy tại: http://localhost:3001
- Đảm bảo Node.js >= 18 trước khi cài đặt dependencies

