using Microsoft.AspNetCore.Http;

namespace ConstructOs.Server.Middleware;

public static class FileUploadHelper
{
    public static string GetAvatarUrl(string? filename, IConfiguration configuration)
    {
        if (string.IsNullOrEmpty(filename)) return string.Empty;
        
        // If already a full URL, return as is
        if (filename.StartsWith("http://") || filename.StartsWith("https://"))
        {
            return filename;
        }
        
        // Get base URL from configuration
        var baseUrl = configuration["API_BASE_URL"] ?? 
                     configuration["SERVER_URL"] ?? 
                     (configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                        ? configuration["PRODUCTION_API_URL"] ?? "https://your-api-domain.com"
                        : "http://localhost:5000");
        
        return $"{baseUrl}/uploads/avatars/{filename}";
    }

    public static string GetFileUrl(string? filename, string bucketName, IConfiguration configuration)
    {
        if (string.IsNullOrEmpty(filename)) return string.Empty;
        
        // If already a full URL, return as is
        if (filename.StartsWith("http://") || filename.StartsWith("https://"))
        {
            return filename;
        }
        
        // Get base URL from configuration
        var baseUrl = configuration["API_BASE_URL"] ?? 
                     configuration["SERVER_URL"] ?? 
                     (configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                        ? configuration["PRODUCTION_API_URL"] ?? "https://your-api-domain.com"
                        : "http://localhost:5000");
        
        return $"{baseUrl}/uploads/{bucketName}/{filename}";
    }

    public static async Task<(string filename, string url)> HandleFileUpload(
        IFormFile file,
        string bucketName,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        
        // Check if Supabase Storage is enabled
        if (Utils.SupabaseStorage.IsSupabaseStorageEnabled(configuration))
        {
            // Read file to buffer
            byte[] fileBuffer;
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                fileBuffer = memoryStream.ToArray();
            }
            
            // Upload to Supabase
            var supabaseUrl = await Utils.SupabaseStorage.UploadToSupabaseStorage(
                configuration, bucketName, fileBuffer, uniqueName, file.ContentType);
            
            if (!string.IsNullOrEmpty(supabaseUrl))
            {
                // Return full URL as filename for Supabase
                return (supabaseUrl, supabaseUrl);
            }
        }
        
        // Fallback to local filesystem
        var uploadDir = Path.Combine(environment.ContentRootPath, "uploads", bucketName);
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
        }
        
        var filePath = Path.Combine(uploadDir, uniqueName);
        
        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        
        // Get URL
        var url = GetFileUrl(uniqueName, bucketName, configuration);
        
        return (uniqueName, url);
    }

    public static bool IsImageFile(IFormFile file)
    {
        var allowedExtensions = new[] { ".jpeg", ".jpg", ".png", ".gif", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        var contentType = file.ContentType.ToLower();
        
        return allowedExtensions.Contains(extension) || 
               contentType.Contains("image/");
    }

    public static bool IsDocumentFile(IFormFile file)
    {
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        var contentType = file.ContentType.ToLower();
        
        return allowedExtensions.Contains(extension) ||
               contentType.Contains("pdf") ||
               contentType.Contains("msword") ||
               contentType.Contains("spreadsheet") ||
               contentType.Contains("csv");
    }

    public static async Task<List<(string filename, string url)>> HandleMultipleFileUpload(
        IFormFileCollection files,
        string bucketName,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        int maxFiles = 10,
        long maxFileSize = 5 * 1024 * 1024) // 5MB default
    {
        var results = new List<(string filename, string url)>();

        if (files == null || files.Count == 0)
        {
            return results;
        }

        if (files.Count > maxFiles)
        {
            throw new Exception($"Chỉ cho phép upload tối đa {maxFiles} files");
        }

        // Check if Supabase Storage is enabled
        var useSupabase = Utils.SupabaseStorage.IsSupabaseStorageEnabled(configuration);

        if (!useSupabase)
        {
            // Create upload directory
            var uploadDir = Path.Combine(environment.ContentRootPath, "uploads", bucketName);
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }
        }

        foreach (var file in files)
        {
            if (file.Length > maxFileSize)
            {
                throw new Exception($"File {file.FileName} quá lớn. Kích thước tối đa là {maxFileSize / 1024 / 1024}MB");
            }

            var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

            if (useSupabase)
            {
                // Read file to buffer
                byte[] fileBuffer;
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    fileBuffer = memoryStream.ToArray();
                }

                // Upload to Supabase
                var supabaseUrl = await Utils.SupabaseStorage.UploadToSupabaseStorage(
                    configuration, bucketName, fileBuffer, uniqueName, file.ContentType);

                if (!string.IsNullOrEmpty(supabaseUrl))
                {
                    results.Add((supabaseUrl, supabaseUrl));
                    continue;
                }
            }

            // Fallback to local filesystem
            var uploadDir = Path.Combine(environment.ContentRootPath, "uploads", bucketName);
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            var filePath = Path.Combine(uploadDir, uniqueName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Get URL
            var url = GetFileUrl(uniqueName, bucketName, configuration);
            results.Add((uniqueName, url));
        }

        return results;
    }
}

