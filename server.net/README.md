# ConstructOs Server (.NET)

Đây là phiên bản .NET của ConstructOs Server, được chuyển đổi từ Node.js/TypeScript sang ASP.NET Core.

## Yêu cầu

- .NET 8.0 SDK hoặc cao hơn
- MySQL hoặc PostgreSQL database
- Visual Studio 2022, VS Code, hoặc bất kỳ IDE nào hỗ trợ .NET

## Cài đặt

1. Cài đặt .NET 8.0 SDK từ [dotnet.microsoft.com](https://dotnet.microsoft.com/download)

2. Restore dependencies:
```bash
dotnet restore
```

3. Cấu hình database trong `appsettings.json` hoặc sử dụng environment variables:
```json
{
  "DB_TYPE": "mysql",  // hoặc "postgres"
  "DB_HOST": "localhost",
  "DB_PORT": "3306",
  "DB_USER": "root",
  "DB_PASSWORD": "",
  "DB_NAME": "constructos",
  "JWT_SECRET": "your-secret-key-here"
}
```

4. Chạy ứng dụng:
```bash
dotnet run
```

Server sẽ chạy tại `http://localhost:5000` hoặc port được cấu hình.

## Cấu trúc dự án

```
server.net/
├── Controllers/          # API Controllers
├── Config/              # Database configuration
├── Middleware/          # Authentication middleware
├── Models/              # Data models
├── Utils/               # Helper utilities
├── Program.cs           # Application entry point
└── appsettings.json     # Configuration file
```

## API Endpoints

Tương tự như server Node.js, các endpoints bao gồm:

- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/projects/*` - Project management
- `/api/tasks/*` - Task management
- `/api/materials/*` - Material management
- Và nhiều endpoints khác...

## Migration từ Node.js

Dự án này đã được chuyển đổi từ server Node.js với các thay đổi chính:

1. **Database**: Sử dụng Dapper thay vì raw SQL queries
2. **Authentication**: Sử dụng JWT Bearer authentication của ASP.NET Core
3. **Routing**: Sử dụng attribute routing thay vì Express routes
4. **Dependency Injection**: Sử dụng built-in DI container của .NET

## Development

Để chạy ở chế độ development:

```bash
dotnet watch run
```

Điều này sẽ tự động reload khi có thay đổi code.

## Build

Để build production:

```bash
dotnet publish -c Release
```

Output sẽ nằm trong thư mục `bin/Release/net8.0/publish/`.

