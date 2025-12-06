# Cách Kiểm Tra Dữ Liệu

## 🔍 Kiểm Tra Dữ Liệu Trong Database MySQL

### Xem số lượng records:

```bash
# Personnel
mysql -u constructos_user -pconstructos123 constructos -e "SELECT COUNT(*) as total_personnel FROM personnel;"

# Users
mysql -u constructos_user -pconstructos123 constructos -e "SELECT COUNT(*) as total_users FROM users;"

# Projects
mysql -u constructos_user -pconstructos123 constructos -e "SELECT COUNT(*) as total_projects FROM projects;"

# Tất cả tables
mysql -u constructos_user -pconstructos123 constructos -e "
SELECT 
    'personnel' as table_name, COUNT(*) as total FROM personnel
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'materials', COUNT(*) FROM materials;
"
```

### Xem dữ liệu:

```bash
# Xem personnel
mysql -u constructos_user -pconstructos123 constructos -e "SELECT * FROM personnel;"

# Xem users
mysql -u constructos_user -pconstructos123 constructos -e "SELECT * FROM users;"
```

---

## 💾 Kiểm Tra Dữ Liệu Trong Memory (Server)

### Khi server đang chạy:

1. Mở browser
2. Vào: `http://localhost:2222/api/personnel`
3. Sẽ thấy dữ liệu (nếu có trong memory)

### Hoặc dùng curl:

```bash
# Xem personnel trong memory
curl http://localhost:2222/api/personnel

# Xem projects
curl http://localhost:2222/api/projects
```

---

## 🔄 So Sánh

| Nơi | Cách kiểm tra | Dữ liệu |
|-----|---------------|---------|
| **MySQL Database** | Adminer hoặc MySQL CLI | Hiện tại: **0 records** (rỗng) |
| **Server Memory** | API endpoint | Có thể có dữ liệu khi server chạy |

---

## ⚠️ Lưu Ý

- Dữ liệu trong **memory** chỉ tồn tại khi server đang chạy
- Khi restart server → mất hết dữ liệu trong memory
- Dữ liệu trong **MySQL** sẽ được lưu vĩnh viễn

---

## 🎯 Kết Luận

Nếu bạn tạo personnel trên FE và không thấy trong Adminer:
- ✅ Dữ liệu đã được tạo (trong memory)
- ❌ Chưa được lưu vào MySQL database
- ✅ Cần migrate controllers để lưu vào MySQL

