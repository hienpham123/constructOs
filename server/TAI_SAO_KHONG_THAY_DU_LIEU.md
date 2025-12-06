# Tại Sao Không Thấy Dữ Liệu Trong Database?

## 🔍 Vấn Đề

Khi bạn tạo personnel (nhân sự) trên Frontend, dữ liệu **không được lưu vào MySQL database**, mà chỉ lưu trong **RAM (memory)** của server.

### Tại sao?

Hiện tại, server đang sử dụng **in-memory storage** (lưu trong arrays), chưa kết nối với MySQL database.

## 📋 Kiểm Tra

### Kiểm tra dữ liệu trong database MySQL:

```bash
mysql -u constructos_user -pconstructos123 constructos -e "SELECT COUNT(*) FROM personnel;"
```

Kết quả: **0** (không có dữ liệu)

### Kiểm tra dữ liệu trong memory (khi server đang chạy):

Dữ liệu chỉ tồn tại trong RAM khi server đang chạy. Khi restart server → mất hết!

## ⚠️ Hậu Quả

1. ✅ Tạo personnel trên FE → Thành công (lưu vào RAM)
2. ❌ Xem trên Adminer → Không thấy (vì database rỗng)
3. ❌ Restart server → Mất hết dữ liệu

## 🔧 Giải Pháp

Cần cập nhật controllers để lưu vào MySQL thay vì in-memory.

### Hiện tại (In-Memory):

```typescript
// server/src/controllers/personnelController.ts
personnel.push(newPersonnel); // Lưu vào RAM
```

### Cần chuyển sang (MySQL):

```typescript
// Lưu vào database MySQL
await query('INSERT INTO personnel ...', [values]);
```

## 📝 Tình Trạng Hiện Tại

- ✅ Database MySQL đã được setup
- ✅ Connection module đã sẵn sàng (`src/config/db.ts`)
- ⏳ Controllers vẫn đang dùng in-memory
- ⏳ Cần cập nhật controllers để query từ MySQL

## 🚀 Next Steps

Để lưu dữ liệu vào MySQL, cần:

1. Cập nhật controllers để query từ database
2. Thay thế arrays bằng SQL queries
3. Test lại các API endpoints

---

**Tóm lại:** Dữ liệu bạn tạo đang ở trong RAM, không phải database. Cần migrate sang MySQL để lưu vĩnh viễn.

