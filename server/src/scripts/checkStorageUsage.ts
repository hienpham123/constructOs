/**
 * Script to check Supabase Storage usage
 * Run with: npm run check:storage or tsx src/scripts/checkStorageUsage.ts
 */

import { query } from '../config/db.js';
import { 
  isSupabaseStorageEnabled, 
  getSupabaseClient 
} from '../utils/supabaseStorage.js';

interface BucketStats {
  bucketName: string;
  fileCount: number;
  totalSize: number;
  totalSizeMB: number;
  totalSizeGB: number;
}

interface StorageStats {
  buckets: BucketStats[];
  totalFiles: number;
  totalSize: number;
  totalSizeMB: number;
  totalSizeGB: number;
  freeTierLimit: number; // 1GB
  usagePercentage: number;
  warning: boolean;
}

/**
 * Get storage statistics for all buckets
 */
async function getStorageStats(): Promise<StorageStats> {
  const buckets = [
    'avatars',
    'transactions',
    'comments',
    'purchase-request-comments',
    'group-avatars',
    'group-messages',
    'direct-messages',
  ];

  const bucketStats: BucketStats[] = [];
  let totalFiles = 0;
  let totalSize = 0;

  if (!isSupabaseStorageEnabled()) {
    console.log('⚠️  Supabase Storage is not enabled');
    console.log('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
    return {
      buckets: [],
      totalFiles: 0,
      totalSize: 0,
      totalSizeMB: 0,
      totalSizeGB: 0,
      freeTierLimit: 1024 * 1024 * 1024,
      usagePercentage: 0,
      warning: false,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Failed to initialize Supabase client');
  }

  console.log('📊 Checking Supabase Storage usage...\n');

  for (const bucketName of buckets) {
    try {
      const { data, error } = await client.storage.from(bucketName).list('', {
        limit: 10000, // Supabase limit
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
        console.error(`❌ Error listing ${bucketName}:`, error.message);
        continue;
      }

      const files = data || [];
      let bucketSize = 0;
      
      for (const file of files) {
        bucketSize += file.metadata?.size || 0;
      }

      const stats: BucketStats = {
        bucketName,
        fileCount: files.length,
        totalSize: bucketSize,
        totalSizeMB: bucketSize / 1024 / 1024,
        totalSizeGB: bucketSize / 1024 / 1024 / 1024,
      };

      bucketStats.push(stats);
      totalFiles += files.length;
      totalSize += bucketSize;

      // Log bucket stats
      console.log(`📁 ${bucketName}:`);
      console.log(`   Files: ${files.length}`);
      console.log(`   Size: ${(bucketSize / 1024 / 1024).toFixed(2)} MB`);
      console.log('');
    } catch (error: any) {
      console.error(`❌ Error checking ${bucketName}:`, error.message);
    }
  }

  const freeTierLimit = 1024 * 1024 * 1024; // 1GB
  const usagePercentage = (totalSize / freeTierLimit) * 100;
  const warning = usagePercentage > 80;

  return {
    buckets: bucketStats,
    totalFiles,
    totalSize,
    totalSizeMB: totalSize / 1024 / 1024,
    totalSizeGB: totalSize / 1024 / 1024 / 1024,
    freeTierLimit,
    usagePercentage,
    warning,
  };
}

/**
 * Get database file references count
 */
async function getDatabaseFileCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  try {
    // Count avatars in users table
    const users = await query<any[]>(
      "SELECT COUNT(*) as count FROM users WHERE avatar IS NOT NULL AND avatar != ''"
    );
    counts.avatars = users[0]?.count || 0;

    // Count transaction attachments
    const transactions = await query<any[]>(
      'SELECT COUNT(*) as count FROM transaction_attachments'
    );
    counts.transactions = transactions[0]?.count || 0;

    // Count comment attachments
    const comments = await query<any[]>(
      'SELECT COUNT(*) as count FROM comment_attachments'
    );
    counts.comments = comments[0]?.count || 0;

    // Count group messages attachments
    const groupMessages = await query<any[]>(
      'SELECT COUNT(*) as count FROM group_message_attachments'
    );
    counts.groupMessages = groupMessages[0]?.count || 0;

    // Count direct messages attachments
    const directMessages = await query<any[]>(
      'SELECT COUNT(*) as count FROM direct_message_attachments'
    );
    counts.directMessages = directMessages[0]?.count || 0;
  } catch (error: any) {
    console.error('Error getting database counts:', error.message);
  }

  return counts;
}

/**
 * Main function
 */
async function main() {
  try {
    const stats = await getStorageStats();
    const dbCounts = await getDatabaseFileCounts();

    console.log('═══════════════════════════════════════════════════');
    console.log('📊 STORAGE USAGE SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');

    console.log(`📁 Total Files: ${stats.totalFiles}`);
    console.log(`💾 Total Size: ${stats.totalSizeMB.toFixed(2)} MB (${stats.totalSizeGB.toFixed(3)} GB)`);
    console.log(`📊 Free Tier Limit: 1 GB`);
    console.log(`📈 Usage: ${stats.usagePercentage.toFixed(2)}%`);

    if (stats.warning) {
      console.log(`\n⚠️  WARNING: Storage usage is above 80%!`);
      console.log(`   Consider upgrading to Pro tier or cleaning up old files.`);
    } else if (stats.usagePercentage > 50) {
      console.log(`\n💡 INFO: Storage usage is above 50%`);
      console.log(`   Monitor usage to avoid hitting the limit.`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('📋 DATABASE FILE REFERENCES');
    console.log('═══════════════════════════════════════════════════\n');

    console.log(`👤 User Avatars: ${dbCounts.avatars || 0}`);
    console.log(`📦 Transaction Attachments: ${dbCounts.transactions || 0}`);
    console.log(`💬 Comment Attachments: ${dbCounts.comments || 0}`);
    console.log(`👥 Group Message Attachments: ${dbCounts.groupMessages || 0}`);
    console.log(`📨 Direct Message Attachments: ${dbCounts.directMessages || 0}`);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('💡 RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════\n');

    if (stats.totalSizeGB > 0.8) {
      console.log('1. ⚠️  Consider upgrading to Supabase Pro ($25/month)');
      console.log('2. 🗑️  Clean up old/unused files');
      console.log('3. 🗜️  Enable image compression (already done)');
    } else if (stats.totalSizeGB > 0.5) {
      console.log('1. 📊 Monitor storage usage regularly');
      console.log('2. 🗑️  Consider cleaning up old files');
    } else {
      console.log('✅ Storage usage is healthy');
    }

    console.log('\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getStorageStats, getDatabaseFileCounts };

