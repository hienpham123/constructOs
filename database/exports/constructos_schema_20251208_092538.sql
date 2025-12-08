-- MySQL dump 10.13  Distrib 9.5.0, for macos26.1 (arm64)
--
-- Host: localhost    Database: constructos
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2e6e5504-d245-11f0-b5c5-3c47b2a8340a:1-2100';

--
-- Table structure for table `comment_attachments`
--

DROP TABLE IF EXISTS `comment_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_id` (`comment_id`),
  CONSTRAINT `comment_attachments_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `project_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user1_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User ID 1 (sorted alphabetically)',
  `user2_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User ID 2 (sorted alphabetically)',
  `user1_last_read_at` timestamp NULL DEFAULT NULL COMMENT 'Last read time for user1',
  `user2_last_read_at` timestamp NULL DEFAULT NULL COMMENT 'Last read time for user2',
  `user1_deleted_at` timestamp NULL DEFAULT NULL COMMENT 'When user1 deleted this conversation',
  `user2_deleted_at` timestamp NULL DEFAULT NULL COMMENT 'When user2 deleted this conversation',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_conversation` (`user1_id`,`user2_id`),
  KEY `idx_user1_id` (`user1_id`),
  KEY `idx_user2_id` (`user2_id`),
  KEY `idx_updated_at` (`updated_at`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_reports`
--

DROP TABLE IF EXISTS `daily_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_reports` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nhân viên báo cáo',
  `report_date` date NOT NULL COMMENT 'Ngày báo cáo',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung báo cáo',
  `suggestion` text COLLATE utf8mb4_unicode_ci COMMENT 'Đề xuất',
  `time_slot` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Khung giờ',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Vị trí',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_report` (`user_id`,`report_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_report_date` (`report_date`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_daily_reports_time_slot` (`time_slot`),
  KEY `idx_daily_reports_location` (`location`),
  CONSTRAINT `daily_reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `direct_message_attachments`
--

DROP TABLE IF EXISTS `direct_message_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direct_message_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_message_id` (`message_id`),
  CONSTRAINT `direct_message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `direct_messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `direct_messages`
--

DROP TABLE IF EXISTS `direct_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direct_messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Người gửi',
  `receiver_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Người nhận',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung tin nhắn',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `direct_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `direct_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `direct_messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_chats`
--

DROP TABLE IF EXISTS `group_chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_chats` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên nhóm chat',
  `avatar` text COLLATE utf8mb4_unicode_ci COMMENT 'Ảnh đại diện nhóm',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả nhóm',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Người tạo nhóm',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `group_chats_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS `group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_members` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('owner','admin','member') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member' COMMENT 'owner = Chủ nhóm, admin = Quản trị viên, member = Thành viên',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm đọc tin nhắn cuối cùng',
  `pinned` tinyint(1) DEFAULT '0' COMMENT 'Ghim nhóm chat lên đầu',
  `pinned_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm ghim nhóm',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_group_user` (`group_id`,`user_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_last_read_at` (`last_read_at`),
  KEY `idx_pinned` (`pinned`,`pinned_at`),
  CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `group_chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_message_attachments`
--

DROP TABLE IF EXISTS `group_message_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_message_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_message_id` (`message_id`),
  CONSTRAINT `group_message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `group_messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_messages`
--

DROP TABLE IF EXISTS `group_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Người gửi',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung tin nhắn',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `group_messages_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `group_chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_typing_indicators`
--

DROP TABLE IF EXISTS `group_typing_indicators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_typing_indicators` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_typing` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_group_user_typing` (`group_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_updated_at` (`updated_at`),
  CONSTRAINT `group_typing_indicators_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `group_chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_typing_indicators_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `material_transactions`
--

DROP TABLE IF EXISTS `material_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_transactions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `attachment` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `performed_by` (`performed_by`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_performed_at` (`performed_at`),
  CONSTRAINT `material_transactions_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `material_transactions_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `material_transactions_ibfk_3` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_stock` decimal(15,3) NOT NULL DEFAULT '0.000',
  `import_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `min_stock` decimal(15,3) NOT NULL DEFAULT '0.000',
  `max_stock` decimal(15,3) NOT NULL DEFAULT '0.000',
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `supplier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('available','low_stock','out_of_stock') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_comments`
--

DROP TABLE IF EXISTS `project_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_comments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('contract','project_files') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'contract = Hợp đồng, project_files = Hồ sơ dự án',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung comment',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_category` (`category`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `project_comments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_comments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `investor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'quoting',
  `progress` tinyint unsigned NOT NULL DEFAULT '0',
  `budget` decimal(15,2) NOT NULL DEFAULT '0.00',
  `actual_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `manager_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_manager_id` (`manager_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`),
  CONSTRAINT `projects_chk_1` CHECK ((`progress` <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `purchase_request_comment_attachments`
--

DROP TABLE IF EXISTS `purchase_request_comment_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_request_comment_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_id` (`comment_id`),
  CONSTRAINT `purchase_request_comment_attachments_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `purchase_request_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `purchase_request_comments`
--

DROP TABLE IF EXISTS `purchase_request_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_request_comments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_request_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung comment',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_purchase_request_id` (`purchase_request_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `purchase_request_comments_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_request_comments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `purchase_requests`
--

DROP TABLE IF EXISTS `purchase_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_requests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected','ordered') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_at` (`requested_at`),
  KEY `idx_project_id` (`project_id`),
  CONSTRAINT `purchase_requests_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `purchase_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  CONSTRAINT `purchase_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `purchase_requests_ibfk_4` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID của vai trò',
  `permission_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại quyền: view_drawing, view_contract, view_daily_report, view_project_report',
  `allowed` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Có được phép hay không (TRUE/FALSE)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`,`permission_type`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_type` (`permission_type`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý quyền của từng vai trò';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên vai trò (ví dụ: admin, director, project_manager)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả vai trò',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý các vai trò trong hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transaction_attachments`
--

DROP TABLE IF EXISTS `transaction_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transaction_id` (`transaction_id`),
  CONSTRAINT `transaction_attachments_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `material_transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive','on_leave','banned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `avatar` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_users_role_id` (`role`),
  KEY `idx_role` (`role`),
  KEY `idx_code` (`code`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_team` (`team`),
  CONSTRAINT `fk_users_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'constructos'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-08  9:25:39
