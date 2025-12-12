using Microsoft.Extensions.Configuration;

namespace ConstructOs.Server.Utils;

public static class SupabaseStorage
{
    private static Supabase.Client? _supabaseClient;

    public static Supabase.Client? GetSupabaseClient(IConfiguration configuration)
    {
        var supabaseUrl = configuration["SUPABASE_URL"];
        var supabaseKey = configuration["SUPABASE_SERVICE_ROLE_KEY"];

        if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
        {
            Console.WriteLine("❌ Supabase not configured - missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
            return null;
        }

        if (_supabaseClient != null)
        {
            return _supabaseClient;
        }

        try
        {
            var keyPreview = supabaseKey.Length > 20 ? supabaseKey.Substring(0, 20) + "..." : supabaseKey;
            Console.WriteLine($"✅ Initializing Supabase client with URL: {supabaseUrl}");
            Console.WriteLine($"✅ Using Service Role Key: {keyPreview} (length: {supabaseKey.Length})");

            _supabaseClient = new Supabase.Client(supabaseUrl, supabaseKey, new Supabase.SupabaseOptions
            {
                AutoRefreshToken = false,
                AutoConnectRealtime = false
            });

            Console.WriteLine("✅ Supabase client initialized successfully");
            return _supabaseClient;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"❌ Error initializing Supabase client: {ex}");
            return null;
        }
    }

    public static async Task<string?> UploadToSupabaseStorage(
        IConfiguration configuration,
        string bucketName,
        byte[] fileBuffer,
        string fileName,
        string contentType)
    {
        var client = GetSupabaseClient(configuration);
        if (client == null)
        {
            Console.WriteLine($"⚠️  Supabase Storage not enabled - missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
            return null;
        }

        try
        {
            Console.WriteLine($"📤 Uploading to Supabase Storage: {bucketName}/{fileName} ({(fileBuffer.Length / 1024.0):F2} KB)");

            var bucket = client.Storage.From(bucketName);
            var result = await bucket.Upload(fileBuffer, fileName, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = true
            });

            if (result == null)
            {
                Console.Error.WriteLine($"❌ Error uploading to Supabase Storage ({bucketName})");
                return null;
            }

            var publicUrl = bucket.GetPublicUrl(fileName);

            Console.WriteLine($"✅ Uploaded to Supabase: {publicUrl}");
            return publicUrl;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"❌ Error uploading buffer to Supabase Storage: {ex}");
            return null;
        }
    }

    public static async Task<bool> DeleteFromSupabaseStorage(
        IConfiguration configuration,
        string bucketName,
        string fileName)
    {
        var client = GetSupabaseClient(configuration);
        if (client == null)
        {
            return false;
        }

        try
        {
            var bucket = client.Storage.From(bucketName);
            var result = await bucket.Remove(new[] { fileName });

            return result != null;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting file from Supabase Storage: {ex}");
            return false;
        }
    }

    public static bool IsSupabaseStorageEnabled(IConfiguration configuration)
    {
        var supabaseUrl = configuration["SUPABASE_URL"];
        var supabaseKey = configuration["SUPABASE_SERVICE_ROLE_KEY"];
        return !string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey);
    }

    public static string GetSupabaseStorageUrl(IConfiguration configuration, string bucketName, string fileName)
    {
        var client = GetSupabaseClient(configuration);
        if (client == null)
        {
            return string.Empty;
        }

        try
        {
            var bucket = client.Storage.From(bucketName);
            var publicUrl = bucket.GetPublicUrl(fileName);
            return publicUrl;
        }
        catch
        {
            return string.Empty;
        }
    }

    private static string GetContentType(string ext)
    {
        var contentTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { ".jpg", "image/jpeg" },
            { ".jpeg", "image/jpeg" },
            { ".png", "image/png" },
            { ".gif", "image/gif" },
            { ".webp", "image/webp" },
            { ".pdf", "application/pdf" },
            { ".doc", "application/msword" },
            { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            { ".xls", "application/vnd.ms-excel" },
            { ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            { ".csv", "text/csv" }
        };

        return contentTypes.TryGetValue(ext, out var contentType) ? contentType : "application/octet-stream";
    }
}

