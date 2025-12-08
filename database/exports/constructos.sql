-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th12 08, 2025 lúc 02:31 AM
-- Phiên bản máy phục vụ: 9.5.0
-- Phiên bản PHP: 8.5.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `constructos`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `comment_attachments`
--

CREATE TABLE `comment_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `comment_attachments`
--

INSERT INTO `comment_attachments` (`id`, `comment_id`, `filename`, `original_filename`, `file_type`, `file_size`, `file_url`, `created_at`) VALUES
('1443edd7-2f7d-4f45-bd50-088102f52376', 'a580b514-574a-4cc3-93c9-f0da81273f98', 'e7f368f3-9853-472a-a82e-e32aae614431.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 9.22.01â¯SA.png', 'image/png', 1873929, 'http://localhost:2222/uploads/comments/e7f368f3-9853-472a-a82e-e32aae614431.png', '2025-12-07 02:57:56'),
('419cc002-fffe-45c2-a35d-ba8472b72a7e', '999eeb65-b527-406a-b75b-148e4c061089', '4642f8c6-b828-424c-b85d-9a4652fb9843.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 9.41.30â¯SA.png', 'image/png', 342621, 'http://localhost:2222/uploads/comments/4642f8c6-b828-424c-b85d-9a4652fb9843.png', '2025-12-07 02:47:22'),
('56bb3695-39ce-43ff-a608-7a70be37cd4f', '8878100f-b5d1-43ed-a73a-f8e26a81f0f1', '89f9cef7-81f8-4ac7-a2f1-6e2ddcb38cea.xlsx', 'Danh_sach_vat_tu_20251206_222216 (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/comments/89f9cef7-81f8-4ac7-a2f1-6e2ddcb38cea.xlsx', '2025-12-07 05:01:57'),
('86eccfb1-ae80-42b2-8e55-0f25114efd59', '58c0e957-f055-4cae-9c21-e21649e4adeb', 'd04043e1-07c5-4a8f-a734-7bb8b25c8aa4.png', 'image.png', 'image/png', 131297, 'http://localhost:2222/uploads/comments/d04043e1-07c5-4a8f-a734-7bb8b25c8aa4.png', '2025-12-07 05:02:12'),
('8e3303be-9c65-4532-a900-30f5b86c4e3e', '8878100f-b5d1-43ed-a73a-f8e26a81f0f1', 'f32cf5ff-89f7-4dfe-9946-83bdcc8edf40.xlsx', 'Danh_sach_du_an.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 19183, 'http://localhost:2222/uploads/comments/f32cf5ff-89f7-4dfe-9946-83bdcc8edf40.xlsx', '2025-12-07 05:01:57'),
('ac542d81-229d-4fbe-a5b1-c815aff9335c', '1a22332d-67b3-46ac-89d7-19a35d3d7d92', '7dba1397-45b3-4f4d-9f09-b6df8b7ec835.png', 'AÌnh maÌn hiÌnh 2025-12-06 luÌc 11.35.23â¯CH.png', 'image/png', 10541, 'http://localhost:2222/uploads/comments/7dba1397-45b3-4f4d-9f09-b6df8b7ec835.png', '2025-12-07 02:57:04'),
('c2c4eab0-74ac-4422-9ce0-84a3200172b8', '7ad476c6-6d56-4911-b85b-93e97d83d7a4', '7cbf49e4-3225-40e8-bbb1-1184cb1235c8.png', 'image.png', 'image/png', 131297, 'http://localhost:2222/uploads/comments/7cbf49e4-3225-40e8-bbb1-1184cb1235c8.png', '2025-12-07 02:04:46'),
('ee893787-cf1d-4059-a5e9-16b273475267', 'ebc59bbc-292f-46cd-a01d-33339d2b8a1b', 'e3184e34-e3ba-4267-b244-3539a256abfd.xlsx', 'Danh_sach_du_an.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 19183, 'http://localhost:2222/uploads/comments/e3184e34-e3ba-4267-b244-3539a256abfd.xlsx', '2025-12-07 02:05:13'),
('f2804f63-58a9-40a1-bd61-149aa56ea19e', '58c0e957-f055-4cae-9c21-e21649e4adeb', 'c9331428-ec8f-4a53-a263-62c66bbb5c39.png', 'png-clipart-minecraft-pixel-art-graphics-minecraft-gun-mod-angle-bead.png', 'image/png', 2735, 'http://localhost:2222/uploads/comments/c9331428-ec8f-4a53-a263-62c66bbb5c39.png', '2025-12-07 05:02:12');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `conversations`
--

CREATE TABLE `conversations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user1_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User ID 1 (sorted alphabetically)',
  `user2_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User ID 2 (sorted alphabetically)',
  `user1_last_read_at` timestamp NULL DEFAULT NULL COMMENT 'Last read time for user1',
  `user2_last_read_at` timestamp NULL DEFAULT NULL COMMENT 'Last read time for user2',
  `user1_deleted_at` timestamp NULL DEFAULT NULL COMMENT 'When user1 deleted this conversation',
  `user2_deleted_at` timestamp NULL DEFAULT NULL COMMENT 'When user2 deleted this conversation',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `conversations`
--

INSERT INTO `conversations` (`id`, `user1_id`, `user2_id`, `user1_last_read_at`, `user2_last_read_at`, `user1_deleted_at`, `user2_deleted_at`, `created_at`, `updated_at`) VALUES
('f8096dff-7ddf-4add-911a-709259a9226d', '6843c1de-9b50-40d1-8eca-9990c2b701c2', '765ca201-4c19-4c58-bf70-d51962ea5891', NULL, '2025-12-08 01:52:38', NULL, NULL, '2025-12-07 18:28:01', '2025-12-08 01:52:38'),
('f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-08 02:10:34', '2025-12-08 02:11:24', NULL, NULL, '2025-12-07 18:15:36', '2025-12-08 02:12:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `daily_reports`
--

CREATE TABLE `daily_reports` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nhân viên báo cáo',
  `report_date` date NOT NULL COMMENT 'Ngày báo cáo',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung báo cáo',
  `suggestion` text COLLATE utf8mb4_unicode_ci COMMENT 'Đề xuất',
  `time_slot` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Khung giờ',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Vị trí',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `daily_reports`
--

INSERT INTO `daily_reports` (`id`, `user_id`, `report_date`, `content`, `suggestion`, `time_slot`, `location`, `created_at`, `updated_at`) VALUES
('16ac57c1-fad0-414b-99e2-6e89e4a034d7', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07', 'tôi báo cáo', NULL, '8h đến 12h', 'Văn Phòng', '2025-12-07 14:02:12', '2025-12-07 14:02:12');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `direct_messages`
--

CREATE TABLE `direct_messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Người gửi',
  `receiver_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Người nhận',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung tin nhắn',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `direct_messages`
--

INSERT INTO `direct_messages` (`id`, `conversation_id`, `sender_id`, `receiver_id`, `content`, `created_at`, `updated_at`) VALUES
('00228b4d-01de-45b8-b3e2-b644330aabdb', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:47:35', '2025-12-08 01:47:35'),
('00f23807-16ab-4e5e-9e3c-2363052d993e', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'vl', '2025-12-08 02:06:28', '2025-12-08 02:06:28'),
('01364c35-111e-4348-9b9d-9f95b022abf2', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:47:46', '2025-12-08 01:47:46'),
('01a617d4-d3d0-40c6-86c1-96994774c88d', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ngon', '2025-12-08 02:06:20', '2025-12-08 02:06:20'),
('04005098-46cd-4929-bdb1-5bf6c1d4fbf5', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '4', '2025-12-08 02:10:39', '2025-12-08 02:10:39'),
('10cd4237-d1c3-4064-bf10-0ca97d231b4c', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ăn j chưa', '2025-12-08 01:56:20', '2025-12-08 01:56:20'),
('1205caa3-7ad8-4f15-bc5d-4fc7896ce9a9', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:53:56', '2025-12-08 01:53:56'),
('12fe013a-69b3-48e2-876e-d5ee5630f79c', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:28', '2025-12-07 18:27:28'),
('1792d82c-45de-4dfd-8a3a-1eaf8d418104', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ăn j chưa', '2025-12-08 02:10:55', '2025-12-08 02:10:55'),
('1d27ef6e-1676-4d5a-ae99-e590fddc8884', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:40', '2025-12-08 01:50:40'),
('1d41cc7f-ca7d-4cb7-8d1d-dae1b9d935c4', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '1', '2025-12-08 02:10:37', '2025-12-08 02:10:37'),
('1f6644a8-e0a2-4dd7-9bda-70cd7ae57a7b', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'o', '2025-12-08 02:06:12', '2025-12-08 02:06:12'),
('22deac39-0b06-4f36-9340-7a1cadd47710', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:47:36', '2025-12-08 01:47:36'),
('261ec933-1d7f-4c00-a7b5-c1d2fe7e3af7', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:53:53', '2025-12-08 01:53:53'),
('2b0d836c-7931-45b3-a3e8-1245f96781d0', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '4', '2025-12-08 02:09:56', '2025-12-08 02:09:56'),
('2b84fa60-f5b3-41e3-81c8-8a957862d844', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:29', '2025-12-07 18:27:29'),
('2ba71305-b177-4409-a1b8-af3a84ea8948', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đói vkl', '2025-12-07 18:21:58', '2025-12-07 18:21:58'),
('2c89e616-6eca-403c-b0d5-c8424d432ce3', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:53:51', '2025-12-08 01:53:51'),
('3360d4b7-0377-4d9e-9ddc-44a66dd81292', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:48', '2025-12-08 01:50:48'),
('3ae3ceab-1593-446f-b537-3053e91269d5', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:46', '2025-12-08 01:50:46'),
('3fac1651-9c24-4e2e-8324-5d46f67099a5', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:26', '2025-12-07 18:27:26'),
('4254acdc-4faa-428c-a7a3-c183601badd1', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:27', '2025-12-07 18:27:27'),
('42a5520b-4694-492d-b555-3e9868f7bd86', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:50', '2025-12-08 01:50:50'),
('43bbaf1a-f89e-47ba-98ed-911706fbbf25', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:51:04', '2025-12-08 01:51:04'),
('4adec6ba-9728-47d0-b8d0-d9d197f16d83', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:53:48', '2025-12-08 01:53:48'),
('4c3cf215-fe4c-4778-9781-67b540cf4e7a', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:47:57', '2025-12-08 01:47:57'),
('4c8046d5-3e8a-4e78-8fa9-a21bfbd6fbd6', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:47:55', '2025-12-08 01:47:55'),
('4fe5c08a-0560-44cc-9bbc-39daf9d9f4cb', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:47:56', '2025-12-08 01:47:56'),
('511c31e0-1aa6-4179-950e-d77b1dae7ac3', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:53:59', '2025-12-08 01:53:59'),
('525340e2-b295-4dea-9739-8c6b71f86e87', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:38', '2025-12-08 01:50:38'),
('5676e94e-42b9-491d-9ebe-392ccd846fa1', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:48:13', '2025-12-08 01:48:13'),
('5809e6c4-611c-49c5-a53c-fd827f2de090', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', ',', '2025-12-07 18:24:59', '2025-12-07 18:24:59'),
('5b686623-d765-402e-9e15-b32594670258', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'oke', '2025-12-07 18:24:02', '2025-12-07 18:24:02'),
('5c231d53-4b0f-482f-9d08-74e5bc4abb4b', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:53:50', '2025-12-08 01:53:50'),
('5d1aa2c8-200b-4493-af85-2aacab72f865', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:41', '2025-12-08 01:50:41'),
('5dc7f6cf-9d60-4d24-b028-61c05feecabe', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:43:50', '2025-12-08 01:43:50'),
('5e270d7e-60fd-4d72-aaea-8da4b522becd', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'oke r đó jajaja', '2025-12-07 18:27:25', '2025-12-07 18:27:25'),
('5e5eafb5-4909-4b1c-8965-2ec7f71847e8', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'nhận dc tn chưa ku', '2025-12-07 18:18:14', '2025-12-07 18:18:14'),
('5f4cf985-0b36-44fc-b932-f25f2be12141', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 02:12:23', '2025-12-08 02:12:23'),
('5fcd0ca6-9ad8-40cd-a272-74f4e33769f1', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đói quá', '2025-12-08 01:52:20', '2025-12-08 01:52:20'),
('600ea0a8-d0ec-452a-89af-e37637143407', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:27', '2025-12-07 18:27:27'),
('65d888f2-cc3f-4f05-ac7d-6c976f6cdc64', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'hihi', '2025-12-08 02:11:19', '2025-12-08 02:11:19'),
('6af08c3f-35fe-4018-8f8e-d0625e3a5967', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'chưa', '2025-12-08 01:52:16', '2025-12-08 01:52:16'),
('6c251a1f-deaf-4f40-86ce-0f50368e84c5', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'oke', '2025-12-07 18:24:09', '2025-12-07 18:24:09'),
('70b567d6-6ad3-4d1e-85d4-2f891d488a04', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'chưa', '2025-12-08 01:56:28', '2025-12-08 01:56:28'),
('70c2db45-c637-409d-a3ba-08964cdb4948', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'l', '2025-12-08 02:01:58', '2025-12-08 02:01:58'),
('714fc1ad-1449-40ff-930c-f3304692f173', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'hello', '2025-12-07 18:15:43', '2025-12-07 18:15:43'),
('7209b609-9bbf-41a3-b583-8e54eed08e11', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:47:40', '2025-12-08 01:47:40'),
('73231a26-732e-49a5-b353-7b966a01f485', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:27', '2025-12-07 18:27:27'),
('74a3317c-7141-4785-894b-a12bd69868fa', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:43:48', '2025-12-08 01:43:48'),
('760126f2-46e1-4e60-8dae-dc535fc84c9b', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'oke chua', '2025-12-08 02:09:42', '2025-12-08 02:09:42'),
('7723dffc-5fd5-4e7a-a6ec-15960848b2e3', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:54:04', '2025-12-08 01:54:04'),
('77cf8be3-dad8-4046-863a-ce1febfff75d', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'k', '2025-12-08 02:06:11', '2025-12-08 02:06:11'),
('77e80a17-d099-400f-bc65-f8c665c42d39', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:59', '2025-12-08 01:50:59'),
('77f4bd25-24c0-4c6a-937b-0eb95d30ad95', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:51:06', '2025-12-08 01:51:06'),
('789fb1bd-0d3c-40f3-98aa-456d61f453e9', 'f8096dff-7ddf-4add-911a-709259a9226d', '765ca201-4c19-4c58-bf70-d51962ea5891', '6843c1de-9b50-40d1-8eca-9990c2b701c2', 'oke', '2025-12-07 18:28:01', '2025-12-07 18:28:01'),
('794e4840-6308-4d46-8320-82589efbab5c', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '2', '2025-12-08 02:10:38', '2025-12-08 02:10:38'),
('7ad64aef-2605-47b2-ad45-98b0cbc57cbb', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'chưa ăn à', '2025-12-07 18:21:43', '2025-12-07 18:21:43'),
('7d0eae1a-a32f-4de4-a86f-b06493c20f14', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:53', '2025-12-08 01:50:53'),
('8125e911-3229-48d9-ae40-24dae47c4162', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:30', '2025-12-07 18:27:30'),
('81fed466-f327-43a5-95ba-483badc64476', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'l', '2025-12-08 02:01:59', '2025-12-08 02:01:59'),
('8278f97b-2c6b-45c0-b114-89c346d774c6', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:28', '2025-12-07 18:27:28'),
('8374d27d-7fec-46d8-a63a-0416b8ee6749', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '', '2025-12-07 18:30:31', '2025-12-07 18:30:31'),
('8fcc01b0-1ba9-4a88-bc8e-200acf3ffff0', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:57', '2025-12-08 01:50:57'),
('90de32af-eed3-4c9a-ab06-4097d5660f7f', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:47', '2025-12-08 01:50:47'),
('9128588e-c8de-4fa8-be7f-c610c88b27fd', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'hi', '2025-12-08 02:09:15', '2025-12-08 02:09:15'),
('92d40497-dfd0-444c-9868-acf486cd5482', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:26', '2025-12-07 18:27:26'),
('9706c7af-7b94-4b44-8216-08ce8282268a', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:54:02', '2025-12-08 01:54:02'),
('980dde4c-0fb9-4aa0-8a8c-e9a2507b3554', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '1', '2025-12-08 02:10:36', '2025-12-08 02:10:36'),
('98c2a4dd-544a-4d7a-9bb3-9d3558dcc953', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'l', '2025-12-08 02:02:23', '2025-12-08 02:02:23'),
('9a050e78-8295-44fb-9c0e-e51a96098b1a', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:47:41', '2025-12-08 01:47:41'),
('9e8cd394-9dd3-49c2-b18b-8c077737e74e', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'sao thế', '2025-12-07 18:18:50', '2025-12-07 18:18:50'),
('a32ee9be-e104-4942-9f73-5cc5015e473a', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '2', '2025-12-08 02:09:55', '2025-12-08 02:09:55'),
('a3904739-1ab5-40f9-8ec0-15095ba334de', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'hehe', '2025-12-08 02:11:27', '2025-12-08 02:11:27'),
('a55abb1e-2965-42a3-9875-4a1035f5339b', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ăn j chưa', '2025-12-08 01:52:11', '2025-12-08 01:52:11'),
('a66f6ef8-3310-49ed-8aff-a93bc415fb3c', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'đá', '2025-12-07 18:24:41', '2025-12-07 18:24:41'),
('a92c5482-6845-420c-931f-dda84acd9c2a', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ngon r nha', '2025-12-08 02:09:27', '2025-12-08 02:09:27'),
('aa0b1126-6d30-41fd-a663-5c36253ad190', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:53:52', '2025-12-08 01:53:52'),
('ac20db4f-ed8d-4ab6-aba2-b2b649811ac0', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '5', '2025-12-08 02:09:57', '2025-12-08 02:09:57'),
('b2c6af21-937c-4e7f-9634-84c9f1e33c80', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:33', '2025-12-07 18:27:33'),
('b3e69f1c-e17c-4886-9edb-6d2d2598ca36', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:56', '2025-12-08 01:50:56'),
('b88ca1c6-b982-458e-85b3-5c55dc4e11d3', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:47:42', '2025-12-08 01:47:42'),
('b91eb5b4-c81a-45b3-81b9-247b8f7542ad', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:31', '2025-12-07 18:27:31'),
('b9d145af-a46f-4255-b220-eddafc8f0abe', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'pl', '2025-12-08 02:01:56', '2025-12-08 02:01:56'),
('c2126ed1-3483-4636-8f7c-287527af4995', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:51:01', '2025-12-08 01:51:01'),
('c302f22f-965a-4f5b-8824-8fab471ab71e', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:45', '2025-12-08 01:50:45'),
('c6818379-a7db-4637-9d5c-76a6636ab7b6', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'có', '2025-12-07 18:21:53', '2025-12-07 18:21:53'),
('c7c9b23f-af40-4b7c-811b-72b047171a0f', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:52', '2025-12-08 01:50:52'),
('cc0d4b9e-6e4f-4075-98f8-74458ac00a2d', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'o', '2025-12-08 02:02:20', '2025-12-08 02:02:20'),
('cfdc3f0f-a9c2-42cf-ac98-3d0ff63886cb', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'kệ tao', '2025-12-07 18:29:33', '2025-12-07 18:29:33'),
('d073f15b-9925-4432-bd84-d70a6a5280a4', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:54', '2025-12-08 01:50:54'),
('d0cd0556-a1d7-41f9-975c-2bfb6364f926', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:42', '2025-12-08 01:50:42'),
('d9330628-16ee-4580-a4ff-4615ff9124e6', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:28', '2025-12-07 18:27:28'),
('d9d14351-33f1-447c-aade-30ecddbca601', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dm gửi lắm tn vkl', '2025-12-07 18:27:43', '2025-12-07 18:27:43'),
('dbf58b2c-591a-4bb0-917f-a57f23e2020e', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:54:01', '2025-12-08 01:54:01'),
('dc2e5549-beb8-454e-b642-4e5a54da6439', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'oke', '2025-12-07 18:25:53', '2025-12-07 18:25:53'),
('dd0a58ef-f56a-436c-9aad-6ee4f930b543', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:51:03', '2025-12-08 01:51:03'),
('def49476-f358-46e3-9c3e-a1b915d00450', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '23', '2025-12-08 02:09:55', '2025-12-08 02:09:55'),
('dfc37e27-87fe-4c2a-9133-f1bcd5bc2fef', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 01:50:44', '2025-12-08 01:50:44'),
('e3ff25c2-0750-4bca-af30-39149640ce79', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'đói ko', '2025-12-07 18:21:47', '2025-12-07 18:21:47'),
('e56a8759-f709-4eb5-afbe-d95b3d83a4ff', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '3', '2025-12-08 02:10:38', '2025-12-08 02:10:38'),
('eff445fc-8935-474d-ae97-3d19fc7a6222', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '5', '2025-12-08 02:11:12', '2025-12-08 02:11:12'),
('f0f1bd6a-704b-4f5a-84ac-8ec4efa2e783', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'k', '2025-12-07 18:27:21', '2025-12-07 18:27:21'),
('f4a40d10-9760-45b1-9d66-338f95cdca24', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'oke', '2025-12-07 18:26:00', '2025-12-07 18:26:00'),
('f4a72075-a395-4e4f-af62-9bdf1426c40f', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'alo', '2025-12-08 02:09:53', '2025-12-08 02:09:53'),
('f6be32bd-076f-47df-8ab2-829198b594eb', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'hello', '2025-12-07 18:15:36', '2025-12-07 18:15:36'),
('f777aca3-dff5-4bff-ba09-77ef993634fb', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ok', '2025-12-08 01:56:14', '2025-12-08 01:56:14'),
('f7c8f469-9fed-4870-b51c-4938f078c14f', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'p', '2025-12-08 02:02:06', '2025-12-08 02:02:06'),
('f83bd83d-6377-46e9-8b8d-57c07cb76ded', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:26', '2025-12-07 18:27:26'),
('fb586e71-105a-46fd-a193-c9cf242af90a', 'f86097c7-6795-4569-ace6-8d4594604604', '765ca201-4c19-4c58-bf70-d51962ea5891', '0f3048f8-f06a-48a9-9165-fae7d964018a', '.', '2025-12-08 01:47:39', '2025-12-08 01:47:39'),
('fe4a4cbb-1de3-4eac-b136-86d79a023cf6', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 18:27:32', '2025-12-07 18:27:32'),
('ff80f247-93f7-4011-b3e0-0c673fe99ebd', 'f86097c7-6795-4569-ace6-8d4594604604', '0f3048f8-f06a-48a9-9165-fae7d964018a', '765ca201-4c19-4c58-bf70-d51962ea5891', '1', '2025-12-08 02:09:54', '2025-12-08 02:09:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `direct_message_attachments`
--

CREATE TABLE `direct_message_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `direct_message_attachments`
--

INSERT INTO `direct_message_attachments` (`id`, `message_id`, `filename`, `original_filename`, `file_type`, `file_size`, `file_url`, `created_at`) VALUES
('1ea68a92-9fcd-48e8-94aa-59e29f3053f1', '8374d27d-7fec-46d8-a63a-0416b8ee6749', '73191e6f-e3de-4b19-91fe-fd44a8411b8d.jpeg', 'cfb7df12-2000-4094-9b50-b5e059ba2648.jpeg', 'image/jpeg', 160859, 'http://localhost:2222/uploads/direct-messages/73191e6f-e3de-4b19-91fe-fd44a8411b8d.jpeg', '2025-12-07 18:30:31'),
('22e920bf-d531-4bd4-9989-214d97b2ad59', '8374d27d-7fec-46d8-a63a-0416b8ee6749', '3058cd62-bbd3-41b4-a7a4-ebe6439c73c7.png', 'image.png', 'image/png', 131297, 'http://localhost:2222/uploads/direct-messages/3058cd62-bbd3-41b4-a7a4-ebe6439c73c7.png', '2025-12-07 18:30:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `group_chats`
--

CREATE TABLE `group_chats` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên nhóm chat',
  `avatar` text COLLATE utf8mb4_unicode_ci COMMENT 'Ảnh đại diện nhóm',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả nhóm',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Người tạo nhóm',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `group_chats`
--

INSERT INTO `group_chats` (`id`, `name`, `avatar`, `description`, `created_by`, `created_at`, `updated_at`) VALUES
('6c1ed396-abb5-410f-93ae-be429b41d9b0', 'Nhóm 1', NULL, NULL, '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 06:39:05', '2025-12-07 06:39:05'),
('bbc2a200-caae-4620-977e-b38af5644e5a', 'Kho lưu trữ', '44f349e1-ff77-461c-9dfe-59a2df6acfde.png', NULL, '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 08:00:31', '2025-12-07 16:56:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `group_members`
--

CREATE TABLE `group_members` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('owner','admin','member') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member' COMMENT 'owner = Chủ nhóm, admin = Quản trị viên, member = Thành viên',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm đọc tin nhắn cuối cùng',
  `pinned` tinyint(1) DEFAULT '0' COMMENT 'Ghim nhóm chat lên đầu',
  `pinned_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm ghim nhóm'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `group_members`
--

INSERT INTO `group_members` (`id`, `group_id`, `user_id`, `role`, `joined_at`, `last_read_at`, `pinned`, `pinned_at`) VALUES
('0287d4b2-56c7-4816-b576-54d732332a2c', 'bbc2a200-caae-4620-977e-b38af5644e5a', '07e6568d-604a-46fe-8f24-5299634c493d', 'member', '2025-12-07 08:00:31', NULL, 0, NULL),
('153236aa-9c8d-461e-bb1d-c480693e6597', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'member', '2025-12-07 08:00:31', '2025-12-08 02:17:45', 1, '2025-12-07 17:54:32'),
('3482e5ee-a12c-49ec-b23d-7f65796185a6', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'owner', '2025-12-07 08:00:31', '2025-12-08 02:17:26', 1, '2025-12-07 08:00:44'),
('508a9d0a-6ace-4f38-afca-7480b479eaa7', 'bbc2a200-caae-4620-977e-b38af5644e5a', '6843c1de-9b50-40d1-8eca-9990c2b701c2', 'member', '2025-12-07 08:00:31', NULL, 0, NULL),
('9a5747b2-a2f8-425a-9612-2ffb11d8ea91', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'member', '2025-12-07 06:39:05', '2025-12-07 17:57:42', 0, NULL),
('c0e8764f-7b41-4fc5-ab2a-433a28917ad3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'owner', '2025-12-07 06:39:05', '2025-12-07 18:30:03', 0, NULL),
('c6b84897-8dd2-4a4b-a11d-ac1637c7ef70', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '6843c1de-9b50-40d1-8eca-9990c2b701c2', 'member', '2025-12-07 06:39:05', '2025-12-07 06:40:58', 0, NULL),
('fd0c400f-ca0a-4530-9bb1-d7386bb533a7', 'bbc2a200-caae-4620-977e-b38af5644e5a', 'b6f5f860-68bc-41aa-a59e-46b4e14c70c1', 'member', '2025-12-07 10:03:34', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `group_messages`
--

CREATE TABLE `group_messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Người gửi',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung tin nhắn',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `group_messages`
--

INSERT INTO `group_messages` (`id`, `group_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
('010ef834-8ccc-4291-b23f-f3a0e4390995', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:16', '2025-12-07 08:35:16'),
('02848f2a-b304-428d-816f-4640f4be2da0', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'biết mấy h rồi ko', '2025-12-07 18:15:18', '2025-12-07 18:15:18'),
('031360ee-8e27-4b18-826d-b60c56a0d269', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dđ', '2025-12-07 08:42:30', '2025-12-07 08:42:30'),
('033fe9b1-53ac-4a12-898c-9653e777f782', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:53', '2025-12-07 08:42:53'),
('03bf4064-fac7-4d07-8947-256d31bc7b8a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqd', '2025-12-07 08:42:32', '2025-12-07 08:42:32'),
('03e65bff-7fb8-4c31-ae48-7df3fe881f12', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'thế thì kệ', '2025-12-07 09:27:04', '2025-12-07 09:27:04'),
('04cd95f3-5af5-4747-83a2-7cb8b670b98b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 't đã ăn j đâu', '2025-12-07 09:04:00', '2025-12-07 09:04:00'),
('04da134f-b74e-4454-bcc7-ecbfda5b6a6f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:28', '2025-12-07 08:42:28'),
('0505321d-4202-4fcd-9816-47c63e5ae242', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:08', '2025-12-07 08:35:08'),
('05af35d3-2c19-4c79-9f88-4fec4fbd2c48', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'gì v', '2025-12-07 06:48:46', '2025-12-07 06:48:46'),
('0813d15e-a15b-4cee-9646-bceaa39cf88f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:41:28', '2025-12-07 08:41:28'),
('0d8e6f7b-868f-4bc6-b146-c830c13e607f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '😜😂', '2025-12-07 06:40:08', '2025-12-07 06:40:08'),
('104d04e3-dcd8-4b81-b71a-575ddbfdc106', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 08:35:05', '2025-12-07 08:35:05'),
('12ae6bbe-5a2e-46b2-8258-01dd61c5017b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ưe', '2025-12-07 08:35:08', '2025-12-07 08:35:08'),
('1315cbb7-2caa-488e-9c8d-38dccd0fae81', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đói há mồm ra', '2025-12-07 09:22:31', '2025-12-07 09:22:31'),
('14d2db12-7430-4304-9882-0b449e2964f6', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ád', '2025-12-07 08:35:07', '2025-12-07 08:35:07'),
('1593f9da-403e-45c9-881f-afc1f669fe0c', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'q', '2025-12-07 08:35:09', '2025-12-07 08:35:09'),
('16d7365e-663a-4e8e-9a8b-3f4f7512aef7', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqư', '2025-12-07 08:35:13', '2025-12-07 08:35:13'),
('1764da61-37c3-474e-8e2e-e057824b7b61', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqdqưd', '2025-12-07 08:42:32', '2025-12-07 08:42:32'),
('17ac32c7-8d18-48ba-ad8f-aa1138dc872a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqư', '2025-12-07 08:35:16', '2025-12-07 08:35:16'),
('180ccf8a-36cc-4e8d-a0bb-a037cc667810', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'có ai ko', '2025-12-07 08:01:02', '2025-12-07 08:01:02'),
('1c15c475-1546-4c32-8980-96bc95ae5fe3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:43', '2025-12-07 08:38:43'),
('1e0a8d0a-437f-4f3a-bbd3-e3a40773992a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqdqưd', '2025-12-07 08:42:33', '2025-12-07 08:42:33'),
('1e50253b-8998-44ae-a2e9-314f7cf8257c', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'dsa', '2025-12-07 08:35:02', '2025-12-07 08:35:02'),
('1ea6f5b1-ed7b-46c8-9aad-930cd3c355a0', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '6843c1de-9b50-40d1-8eca-9990c2b701c2', 'sao thế', '2025-12-07 06:39:30', '2025-12-07 06:39:30'),
('1efff582-5c8c-45da-9886-4529b9b1e226', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'c', '2025-12-07 09:07:33', '2025-12-07 09:07:33'),
('202e0362-71c8-4caa-b734-51ae2614315d', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqưe', '2025-12-07 08:35:14', '2025-12-07 08:35:14'),
('206af3b3-a75a-4fc1-9a55-23d647e1b1de', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '6843c1de-9b50-40d1-8eca-9990c2b701c2', 'đây', '2025-12-07 06:39:28', '2025-12-07 06:39:28'),
('223c7e4d-3c71-4f65-8efa-0e998abba9bf', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ngon choét luôn', '2025-12-08 02:13:11', '2025-12-08 02:13:11'),
('22658687-a114-4ea4-ba0a-24a98d08d66e', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqdqư', '2025-12-07 08:42:33', '2025-12-07 08:42:33'),
('22f769f9-5611-4c79-9a7b-242107a86e85', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:36', '2025-12-07 08:42:36'),
('23901486-c0cc-4b04-964c-0bc3fa441200', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dqwd', '2025-12-07 08:41:26', '2025-12-07 08:41:26'),
('2410db78-a513-41d3-81ee-9f20fd5d04fc', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:41:30', '2025-12-07 08:41:30'),
('25277137-49f6-4718-b84e-d36cba69c858', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đákdas', '2025-12-07 08:41:25', '2025-12-07 08:41:25'),
('266bb996-7a93-4bcf-8c21-530fe3cf7bc6', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '3', '2025-12-07 08:42:37', '2025-12-07 08:42:37'),
('29bae79c-50d2-4c25-8533-aec025df423e', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 02:12:43', '2025-12-08 02:12:43'),
('29eb7db1-521c-45f9-9100-1d0d7584c2db', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqư', '2025-12-07 08:35:16', '2025-12-07 08:35:16'),
('2b0a402d-20c8-4c04-906c-644cbc3ab7b3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'đâsd', '2025-12-07 08:35:00', '2025-12-07 08:35:00'),
('2c930b39-e32a-49f6-bc75-d53a7cd2a63d', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'đói há mồm', '2025-12-07 09:04:05', '2025-12-07 09:04:05'),
('2cf81567-0ff2-40ed-9c35-a109dbc917fd', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 02:12:43', '2025-12-08 02:12:43'),
('2e3031d5-5549-46d2-93f5-cad16d262f93', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'q', '2025-12-07 08:35:09', '2025-12-07 08:35:09'),
('2e397e9d-c314-4ff5-a64a-ec5d763a6277', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:14', '2025-12-07 08:35:14'),
('2f86a387-4aaa-450b-b9f4-3cc761fe5c02', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 08:35:07', '2025-12-07 08:35:07'),
('2fa68bf1-8538-4f63-b0d8-1a7444a81835', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qư', '2025-12-07 08:35:08', '2025-12-07 08:35:08'),
('2fd73185-7277-4102-b3bc-72c0b86df35f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqdqưdưqd', '2025-12-07 08:42:33', '2025-12-07 08:42:33'),
('34bc9a51-efb5-48a5-b950-a4274b685cae', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'á', '2025-12-07 08:35:06', '2025-12-07 08:35:06'),
('365d195f-4b65-47e7-9d67-7697bbfb507d', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'oke nhé', '2025-12-07 08:08:07', '2025-12-07 08:08:07'),
('372bd2a6-d7d5-4049-8f65-fce27aa38854', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '6843c1de-9b50-40d1-8eca-9990c2b701c2', 'ăn đc ko', '2025-12-07 06:40:23', '2025-12-07 06:40:23'),
('3864fc6d-511f-4816-8e1f-323005a0382d', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqdqư', '2025-12-07 08:42:32', '2025-12-07 08:42:32'),
('39a011e8-8c5d-4c58-a4f0-3ac79e6c8d82', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qưd', '2025-12-07 08:41:28', '2025-12-07 08:41:28'),
('3a3051bd-e8cc-44bf-94d3-007d6b0fb74c', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:28', '2025-12-07 08:42:28'),
('3a576df1-8cd1-4a58-9b54-2c8742b8a9e8', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ăn j chưa nhỉ', '2025-12-07 09:03:54', '2025-12-07 09:03:54'),
('3ab40a07-ad67-48de-9b99-b939e72bcb9d', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'chưa', '2025-12-07 09:22:27', '2025-12-07 09:22:27'),
('3ad91bd6-4711-4612-ae0c-de57f6efa554', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưe', '2025-12-07 08:35:12', '2025-12-07 08:35:12'),
('3c494948-580f-40e3-bcf1-a04834d40aa7', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:39:08', '2025-12-07 08:39:08'),
('3f471ad7-ef81-4caf-aad9-f93c02cbebd3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'đá', '2025-12-07 08:35:05', '2025-12-07 08:35:05'),
('3f9c473e-ddbc-4728-b337-1d0291037774', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đói qá', '2025-12-07 06:39:48', '2025-12-07 06:39:48'),
('3ff7ee78-b8a0-43a9-90a9-22834a4517da', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:26', '2025-12-07 08:42:26'),
('4319c0f2-0e22-4a3d-ac89-b25e9d19c1c0', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'làm j có', '2025-12-07 06:49:31', '2025-12-07 06:49:31'),
('437a1508-bd04-42d6-b05d-bdd5d60fb740', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dưq', '2025-12-07 08:41:27', '2025-12-07 08:41:27'),
('44934a1a-5541-40ed-b5df-f1e2497be1ad', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:46', '2025-12-07 08:38:46'),
('44b3acab-5cd9-4ae5-871b-ab4ce1d51d28', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:43', '2025-12-07 08:38:43'),
('44cc7539-92a2-4525-b1a9-be8e5e3663b8', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'sss', '2025-12-07 08:39:10', '2025-12-07 08:39:10'),
('452f7d01-2d12-44b6-afd9-dac620cae4ae', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '4', '2025-12-07 08:42:38', '2025-12-07 08:42:38'),
('469362ef-f3a4-4910-af65-6f9c2f4f88fc', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưe', '2025-12-07 08:35:11', '2025-12-07 08:35:11'),
('46a083ae-126c-44ac-bcc4-0da59f6c970e', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:31', '2025-12-07 08:42:31'),
('46e72b34-d2e7-420b-bad4-cee285aaf6e3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'sa', '2025-12-07 08:35:06', '2025-12-07 08:35:06'),
('47584f53-104b-44a0-8872-5848d5002dea', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:13', '2025-12-07 08:35:13'),
('47cd013a-08a7-4987-bf46-bb6cd8d919e5', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'q', '2025-12-07 08:35:15', '2025-12-07 08:35:15'),
('47f7e300-48f2-4c76-8db4-fc589912e2e1', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqd', '2025-12-07 08:41:32', '2025-12-07 08:41:32'),
('498e699a-3a0a-4c2d-a5c3-fb774954c193', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqư', '2025-12-07 08:35:16', '2025-12-07 08:35:16'),
('4a0e6a10-c651-439d-a18c-3265dc09dcdb', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ae đâu r', '2025-12-07 06:39:21', '2025-12-07 06:39:21'),
('4a1048fe-1150-4455-97f1-ccc933c1375c', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đưq', '2025-12-07 08:42:31', '2025-12-07 08:42:31'),
('4ae4ab65-e763-43a5-9642-fdf832e7cc73', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qe', '2025-12-07 08:35:10', '2025-12-07 08:35:10'),
('4b7c8769-c3a5-4352-88e2-3196b1a029dd', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'gì thế', '2025-12-08 02:15:59', '2025-12-08 02:15:59'),
('4c32c3f7-ac42-4599-941a-1f1d197a83d7', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:18', '2025-12-07 08:35:18'),
('4c89502b-2b51-4de0-8146-f65f23bfcdb0', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'a', '2025-12-07 09:05:08', '2025-12-07 09:05:08'),
('4ca16d7c-caad-4daf-b11b-0b03b6cca693', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:51', '2025-12-07 08:42:51'),
('4cb77308-9fd3-40c5-b786-26b302e09114', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ưq', '2025-12-07 08:35:10', '2025-12-07 08:35:10'),
('4cc67f16-024b-471d-a102-95205b74b123', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqư', '2025-12-07 08:35:18', '2025-12-07 08:35:18'),
('4e67184a-9007-40c2-a1c2-f2b0a1edd9db', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qư', '2025-12-07 08:41:29', '2025-12-07 08:41:29'),
('4f2dd4e8-f7ae-4ab7-b773-7dc17bcbdc13', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqưe', '2025-12-07 08:35:14', '2025-12-07 08:35:14'),
('51b83838-a7bf-437b-ab9c-f8ee00e1286f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:30', '2025-12-07 08:42:30'),
('52779f2c-b57a-4d70-a968-5951bf0da9ed', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', '', '2025-12-07 10:18:14', '2025-12-07 10:18:14'),
('52fc6fb0-3d20-4d82-88f2-3ec479099f7a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:29', '2025-12-07 08:42:29'),
('5392b881-f99f-4ab7-a218-4e27ae87ac2b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'q', '2025-12-07 08:35:15', '2025-12-07 08:35:15'),
('53cd9d98-04ee-4c95-adb2-ba9a31f52080', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qưd', '2025-12-07 08:41:33', '2025-12-07 08:41:33'),
('53d57c48-8b5f-46ff-98be-2a5692d0899b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqweqw', '2025-12-07 09:07:39', '2025-12-07 09:07:39'),
('5519c4c8-2105-4304-a60e-6bf60a65a869', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'làm sao mà chat lắm thế', '2025-12-07 18:15:12', '2025-12-07 18:15:12'),
('5885ab57-3fbe-4ace-856f-1c9fc8f50613', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:45', '2025-12-07 08:38:45'),
('5a77c09d-69e7-454c-84b1-720838a85ffa', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ngon quá luôn', '2025-12-07 09:02:09', '2025-12-07 09:02:09'),
('5be5c835-e279-4941-b74e-5b6a67813c99', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'xin chào', '2025-12-07 13:41:23', '2025-12-07 13:41:23'),
('5cca7823-01b6-49d2-aa7f-d7f096b8b1e0', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ko có j', '2025-12-07 08:02:04', '2025-12-07 08:02:04'),
('5ced2030-9a71-4f0e-85fb-e8c13c2e0eb0', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '6', '2025-12-07 08:42:39', '2025-12-07 08:42:39'),
('5daa10da-d2e2-4a48-be03-4041bc76cc3a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'dá', '2025-12-07 08:35:02', '2025-12-07 08:35:02'),
('5db36971-b92c-48f5-a744-b91c0df7d9fc', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ưe', '2025-12-07 08:35:10', '2025-12-07 08:35:10'),
('5dccc75d-7c17-469c-b9fa-c8efd1422c94', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'c', '2025-12-07 09:07:33', '2025-12-07 09:07:33'),
('5fd3ebb5-7c7b-42f8-8b89-9df9708c602a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eưq', '2025-12-07 08:35:12', '2025-12-07 08:35:12'),
('6015db2c-e1ec-424e-af41-c377e7d6c4a0', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dqwd', '2025-12-07 08:41:29', '2025-12-07 08:41:29'),
('6167f5dc-d5b6-4da8-a1d0-4747d0ba6817', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưe', '2025-12-07 08:35:09', '2025-12-07 08:35:09'),
('629654c4-4d8e-48a9-9731-8737119d9ac4', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dqw', '2025-12-07 08:41:29', '2025-12-07 08:41:29'),
('630452cb-c90d-483d-85ad-ca73b34b4f38', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqweq', '2025-12-07 08:35:18', '2025-12-07 08:35:18'),
('63f1fd4e-f0f5-4702-8de5-c453cee35456', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'nói lắm vkl', '2025-12-07 17:53:48', '2025-12-07 17:53:48'),
('65ec0a8e-919a-434d-8e8e-fc29dbd1cb8f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 08:35:06', '2025-12-07 08:35:06'),
('673c9001-51dd-45b8-ad18-793818277fdc', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', '', '2025-12-07 10:17:24', '2025-12-07 10:17:24'),
('67e8af15-f2d2-4465-bef4-176746fc2b79', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:09', '2025-12-07 08:35:09'),
('682cddef-ebe5-408e-ac91-a35c75525438', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đ', '2025-12-07 08:42:28', '2025-12-07 08:42:28'),
('68b5b25d-325a-48fc-b9fb-fbc495622ea1', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'q', '2025-12-07 08:35:12', '2025-12-07 08:35:12'),
('691d6462-72e4-45db-a6bc-9c132bb861c8', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '6843c1de-9b50-40d1-8eca-9990c2b701c2', 'quán nào đó', '2025-12-07 06:40:19', '2025-12-07 06:40:19'),
('6adf5081-feff-4605-bcfb-773521199bd3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qư', '2025-12-07 08:41:29', '2025-12-07 08:41:29'),
('6c3b2f16-11a3-4d04-82fc-f13537b3f46a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qưd', '2025-12-07 08:41:31', '2025-12-07 08:41:31'),
('6ca5de20-fe00-49c1-be50-dc8b228c692d', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:11', '2025-12-07 08:35:11'),
('6e1187bc-d060-4b1e-8176-c7e1191f95cb', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ss', '2025-12-07 08:38:47', '2025-12-07 08:38:47'),
('6f4791e3-14ea-4b0a-9e43-e871b947ae99', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 02:12:44', '2025-12-08 02:12:44'),
('7072080a-076e-4ff8-8516-1a056e67cfd6', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:57', '2025-12-07 08:42:57'),
('7160f3ef-69fb-4460-880b-83cf27cb1a09', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qưdqư', '2025-12-07 08:41:31', '2025-12-07 08:41:31'),
('71b94889-df18-44f7-885a-53f57b3fea8a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đc nhé', '2025-12-07 06:40:29', '2025-12-07 06:40:29'),
('76606d04-a813-4def-b822-99a759a21054', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:39:09', '2025-12-07 08:39:09'),
('76e5cf1c-9365-43fe-9d61-733d597404e8', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qưd', '2025-12-07 08:41:30', '2025-12-07 08:41:30'),
('77161187-f501-4d22-9a74-b1f5f5b9fcad', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', '', '2025-12-07 17:55:19', '2025-12-07 17:55:19'),
('7753cf47-84df-49b5-86c1-c95e9cd0d578', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:44', '2025-12-07 08:38:44'),
('77941e38-e641-4eb6-bacf-783c5fc3f634', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:13', '2025-12-07 08:35:13'),
('78e327df-c1a1-431a-b434-59dd269cdd87', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:27', '2025-12-07 08:42:27'),
('7a60fc6e-f350-4e7a-816d-4b1dd332806b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'q', '2025-12-07 08:35:08', '2025-12-07 08:35:08'),
('7a658a9e-e79a-40ac-b696-2c27d9553429', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đói vkl', '2025-12-08 02:16:23', '2025-12-08 02:16:23'),
('7a911c1b-e1a5-4625-9830-d6fc72e82c0b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:39:09', '2025-12-07 08:39:09'),
('7b197554-c5ea-4cef-97ac-2329ec41227b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qưd', '2025-12-07 08:41:31', '2025-12-07 08:41:31'),
('7b222899-aba5-45ed-a507-f740fd058ca6', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eq', '2025-12-07 08:35:10', '2025-12-07 08:35:10'),
('7b5e994b-804f-4d97-b6f9-cd4ead8719f3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ad', '2025-12-07 08:35:06', '2025-12-07 08:35:06'),
('7e3f48f6-b2f0-4e85-a249-2d1b549993dc', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:46', '2025-12-07 08:38:46'),
('7efd5865-bb71-434b-a3be-b1fe05934232', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:13', '2025-12-07 08:35:13'),
('825170d7-effd-47f8-bc23-7c545c2a75ec', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 't nè', '2025-12-07 08:01:44', '2025-12-07 08:01:44'),
('839e1e5d-046c-4a35-ab10-47fbec87eac8', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dd', '2025-12-07 08:42:31', '2025-12-07 08:42:31'),
('83a2aee1-df20-4cad-88e3-add279ca78aa', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqd', '2025-12-07 08:41:33', '2025-12-07 08:41:33'),
('846c7204-0bc5-4d40-a056-e02caf60a918', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đ', '2025-12-07 08:42:31', '2025-12-07 08:42:31'),
('85dfc857-ca72-4a44-bbf3-2807fd99182b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qưdqưd', '2025-12-07 08:41:34', '2025-12-07 08:41:34'),
('8635d551-b523-45f1-a0ad-37ee460e32c6', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:29', '2025-12-07 08:42:29'),
('88e190c4-378b-4f26-be0f-70b1fcd0b769', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:46', '2025-12-07 08:38:46'),
('8926a06d-5761-4600-bb59-b270229f30a0', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:53', '2025-12-07 08:42:53'),
('8b03d83f-dcc8-471a-bb83-2634782fba98', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'đói à', '2025-12-08 02:16:06', '2025-12-08 02:16:06'),
('8c9dd11c-6801-4020-acb3-f8d66554216a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ư', '2025-12-07 08:35:10', '2025-12-07 08:35:10'),
('8cd0bffa-ebfc-490a-8a6b-03cc84933ff3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:12', '2025-12-07 08:35:12'),
('8d5a742b-2980-44b3-980e-857b7b88b5a2', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:45', '2025-12-07 08:38:45'),
('8eb22bc2-c639-4778-a0d0-34fa3d66dd93', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'con me may', '2025-12-07 13:41:58', '2025-12-07 13:41:58'),
('9004f418-4237-4d14-94bc-de907dd2f2c8', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'chao cc', '2025-12-07 13:41:47', '2025-12-07 13:41:47'),
('90af530d-5907-4040-a63b-c1f86f0bfe06', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'dsadkasd', '2025-12-07 09:07:36', '2025-12-07 09:07:36'),
('929c2c1b-e445-40c1-95ad-4cc2ae95e7af', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqwe', '2025-12-07 08:35:17', '2025-12-07 08:35:17'),
('94625e80-ea88-42a3-9553-d7d9b83a6e0e', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '4', '2025-12-07 08:42:37', '2025-12-07 08:42:37'),
('96b10081-8130-4c33-995c-a595e57e2c3c', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dqw', '2025-12-07 08:41:27', '2025-12-07 08:41:27'),
('991a0843-0354-495b-a4a9-17ed702a6aca', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:46', '2025-12-07 08:38:46'),
('996dfffc-39e1-4451-915d-ca146b14439b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqư', '2025-12-07 08:35:13', '2025-12-07 08:35:13'),
('99e1695e-7120-49f6-953c-3502bee068f1', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'hehe', '2025-12-08 02:15:50', '2025-12-08 02:15:50'),
('99e5b061-7e4b-4b36-8973-57867a43eeca', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:43', '2025-12-07 08:38:43'),
('9a26254e-e82a-4b91-af98-9cc0ed909e44', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưe', '2025-12-07 08:35:15', '2025-12-07 08:35:15'),
('9afbb46a-5b0d-49dc-8856-2818819c401e', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qư', '2025-12-07 08:35:17', '2025-12-07 08:35:17'),
('9b335ba0-c354-4f3f-8885-dc2e089a2c35', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'l', '2025-12-08 02:12:59', '2025-12-08 02:12:59'),
('9c28b3f6-a2dd-4cf8-bdf6-e8b0c19ba8d7', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dqwdqw', '2025-12-07 08:41:35', '2025-12-07 08:41:35'),
('9f04403f-1edf-40cb-8ad3-806246c50328', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'cdasd', '2025-12-07 09:07:35', '2025-12-07 09:07:35'),
('9f40e8bc-9ad5-4655-97b5-73f0edf43aba', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qưd', '2025-12-07 08:41:33', '2025-12-07 08:41:33'),
('a16ea89b-5b2f-493b-baf5-ba1ec81adb7a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'c', '2025-12-07 09:07:33', '2025-12-07 09:07:33'),
('a26c0a19-3c92-46da-b5e9-42b4156b7b03', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'á', '2025-12-07 08:35:06', '2025-12-07 08:35:06'),
('a2f0b7ad-4d66-4ee3-a14b-a240d6e65d27', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ngủ đi', '2025-12-07 17:53:44', '2025-12-07 17:53:44'),
('a313bc13-610e-41e9-8b56-99497b13b7ba', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '6843c1de-9b50-40d1-8eca-9990c2b701c2', 'có chuyện gì ah', '2025-12-07 06:39:36', '2025-12-07 06:39:36'),
('a32745e8-95a9-4c87-88f7-ced2968a8e61', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '5', '2025-12-07 08:42:39', '2025-12-07 08:42:39'),
('a393ea50-38ad-4776-9091-f6864dccda07', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'á à', '2025-12-07 15:09:23', '2025-12-07 15:09:23'),
('a3c062bc-fbed-4129-a3e6-8e794608c063', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qư', '2025-12-07 08:35:11', '2025-12-07 08:35:11'),
('a4d68db0-56a1-433e-ba8d-68b1068bc3cc', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưe', '2025-12-07 08:35:08', '2025-12-07 08:35:08'),
('a7d2ea4a-7491-4bb9-9167-e8da2a10ad45', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'd', '2025-12-07 08:35:06', '2025-12-07 08:35:06'),
('a8d81207-0e40-4c23-9961-491fcf3f3c0e', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqweqwe', '2025-12-07 09:07:38', '2025-12-07 09:07:38'),
('aa0e0409-4794-4078-8f66-69ad2118c15a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qư', '2025-12-07 08:35:10', '2025-12-07 08:35:10'),
('aedb8e92-94a8-42a2-8527-f023b14c5a4f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đqwd', '2025-12-07 08:41:32', '2025-12-07 08:41:32'),
('af43e4ce-db10-4de8-ae8f-4466a9f21e3f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:52', '2025-12-07 08:42:52'),
('b04a8aaa-fa13-4a3c-beae-1ac347a9df29', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:54', '2025-12-07 08:42:54'),
('b1df28b1-7798-4902-b5bc-751f364c8274', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', '', '2025-12-07 10:18:25', '2025-12-07 10:18:25'),
('b28939e3-222b-4375-85c4-9e7b320adf54', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '6', '2025-12-07 08:42:39', '2025-12-07 08:42:39'),
('b4114ad0-d460-4534-8528-a0c59fd2b5ec', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqưe', '2025-12-07 08:35:12', '2025-12-07 08:35:12'),
('b4e28c25-c84c-42d7-a8bf-ea23f54b9614', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:50', '2025-12-07 08:42:50'),
('b669ddfb-914d-4ae0-96fe-ec57402cc00e', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'oke nhé', '2025-12-07 18:14:59', '2025-12-07 18:14:59'),
('b739569b-6000-4a03-814d-1ec5f665ffb4', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ss', '2025-12-07 08:38:46', '2025-12-07 08:38:46'),
('b8e37e6d-7d00-4ad5-a7f6-e164b3eb6d19', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đưqd', '2025-12-07 08:42:31', '2025-12-07 08:42:31'),
('b91e4643-fe30-4cc5-b0ca-9527e719b22d', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'l', '2025-12-08 02:12:57', '2025-12-08 02:12:57'),
('bc371d3f-7968-4f83-b07b-55fcf38d72c9', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:41:27', '2025-12-07 08:41:27'),
('bc8e6c8f-cfb6-438a-a8fd-a45ad1f42aa3', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', '', '2025-12-07 17:00:29', '2025-12-07 17:00:29'),
('bdd13aaa-b973-4577-a343-2b8c6c1df2eb', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'con cho nay', '2025-12-07 13:42:02', '2025-12-07 13:42:02'),
('bf28535b-d88b-4042-93fc-766fe8f0b2c3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'thế hả', '2025-12-07 09:05:12', '2025-12-07 09:05:12'),
('bf84e5b1-5807-4753-aa78-0b943abeff6a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'ăn j chưa', '2025-12-07 09:22:14', '2025-12-07 09:22:14'),
('c03b0723-c836-43c4-be14-99b6cbac4c10', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqdqưdưqdqưd', '2025-12-07 08:42:33', '2025-12-07 08:42:33'),
('c0ce1b31-c136-410c-8d0b-6c3781a5b3ea', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '5', '2025-12-07 08:42:38', '2025-12-07 08:42:38'),
('c2f02916-5046-461f-a511-83a921149a6d', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưe', '2025-12-07 08:35:07', '2025-12-07 08:35:07'),
('c324a843-9706-4b6c-8ca2-0f6b06d8092b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưe', '2025-12-07 08:35:08', '2025-12-07 08:35:08'),
('c3cc56c3-fd78-4299-97c1-14813ccb4c12', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '11', '2025-12-07 08:42:35', '2025-12-07 08:42:35'),
('c3e49a63-0f16-4bd4-bc9b-4643648c03f6', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:16', '2025-12-07 08:35:16'),
('c4dac7a5-ebe7-483f-9fc3-f779f2e4bfba', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '', '2025-12-07 06:39:57', '2025-12-07 06:39:57'),
('c6d9da4d-41e1-4d77-9075-421e531984b4', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'chắc là thế r', '2025-12-07 09:05:15', '2025-12-07 09:05:15'),
('c712ca9b-450f-444c-8dde-43fd71f5e1dd', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', '', '2025-12-07 17:00:04', '2025-12-07 17:00:04'),
('c7437998-66e0-438d-8f30-2bb8f4006b3f', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'kk', '2025-12-07 09:27:05', '2025-12-07 09:27:05'),
('c875bab6-98f3-4b22-9693-516c0002350d', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưeqư', '2025-12-07 08:35:15', '2025-12-07 08:35:15'),
('c90fd6a4-96c9-4b72-b7d1-fda52f5e3963', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', '😍', '2025-12-07 17:12:32', '2025-12-07 17:12:32'),
('ca8bb30f-8cd1-441c-bce9-c60b1c5c9bdb', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:42', '2025-12-07 08:38:42'),
('cbd9acec-7bc4-4349-aca5-4f789711bb6a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '6', '2025-12-07 08:42:39', '2025-12-07 08:42:39'),
('d04e7b7b-eac9-4693-baf7-18d3a7ffbf6e', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqd', '2025-12-07 08:42:32', '2025-12-07 08:42:32'),
('d1ac953b-53c4-422c-8859-66bf86134db4', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', ',', '2025-12-08 02:14:02', '2025-12-08 02:14:02'),
('d3748ca8-29dd-408a-81fe-55e8be4fb98b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ưqd', '2025-12-07 08:41:32', '2025-12-07 08:41:32'),
('d6f457d8-368a-49fd-86a2-18a761559f25', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:44', '2025-12-07 08:38:44'),
('d8c9a02c-c70f-4b50-b454-627c1b03dc67', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqw', '2025-12-07 08:35:17', '2025-12-07 08:35:17'),
('d900e9ea-ba04-4a0a-bf41-b28bee549929', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dqưd', '2025-12-07 08:41:29', '2025-12-07 08:41:29'),
('d941e4a2-7482-45b9-b566-6e219b910de2', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:36', '2025-12-07 08:42:36'),
('d948f874-9038-4bd2-958a-80f7543bbf85', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'a', '2025-12-07 09:05:08', '2025-12-07 09:05:08'),
('d9e2d537-4256-48cc-9ea2-11f67974a143', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'ssđwqd', '2025-12-07 08:39:10', '2025-12-07 08:41:08'),
('daf1d746-9470-4134-a40a-5ecaafcc7f1e', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqưeqư', '2025-12-07 08:35:14', '2025-12-07 08:35:14'),
('deaad272-be5f-4de9-9ad2-e738da8a1fce', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'toàn mõm thôi', '2025-12-07 09:25:41', '2025-12-07 09:25:41'),
('df0a22db-2b58-4afd-80fc-72bd045486c2', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưeqưe', '2025-12-07 08:35:15', '2025-12-07 08:35:15'),
('e073c6bf-139c-4fa6-a19b-2f11166d47a4', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'chui cc gi', '2025-12-07 13:41:54', '2025-12-07 13:41:54'),
('e10c4f1e-0406-4fd3-aa07-9297fe47a269', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qư', '2025-12-07 08:35:13', '2025-12-07 08:35:13'),
('e1331db8-a29e-4934-b371-a069f6a4bfb2', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'd', '2025-12-07 08:42:30', '2025-12-07 08:42:30'),
('e20d0fde-5ff8-4f1a-b23d-5a222ff61cc9', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'cc', '2025-12-07 09:05:06', '2025-12-07 09:05:06'),
('e229544e-9f29-4788-9724-d34b6292e500', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', 'chưa ăn j à', '2025-12-08 02:16:03', '2025-12-08 02:16:03'),
('e4198638-fff7-4b92-8a33-5e43a258701b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'cc', '2025-12-07 09:05:07', '2025-12-07 09:05:07'),
('e493f114-e939-4441-a10a-98eb592d6482', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'a', '2025-12-07 09:05:08', '2025-12-07 09:05:08'),
('e4b7aa41-17a1-4e4e-9dd6-e8ec6ad026b0', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'á', '2025-12-07 08:35:05', '2025-12-07 08:35:05'),
('e502b760-49c4-4518-be8a-7855c2bff9ca', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dqưd', '2025-12-07 08:41:30', '2025-12-07 08:41:30'),
('e60fe7ea-9fff-4203-b483-2a5d14373408', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dsadas', '2025-12-07 08:38:41', '2025-12-07 08:38:41'),
('e71d7124-e831-4baf-b35e-5261095f96ac', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'dá', '2025-12-07 08:35:01', '2025-12-07 08:35:01'),
('e7d28564-1f5a-47c4-9e4b-c4ca79077c8c', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '123123123123123123', '2025-12-07 08:38:46', '2025-12-07 08:41:19'),
('e828609e-0ccf-4e69-99ef-48103fa6d6dc', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'dá', '2025-12-07 08:35:04', '2025-12-07 08:35:04'),
('e89868cf-3d66-4680-9552-faa175f210c4', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'qư', '2025-12-07 08:41:28', '2025-12-07 08:41:28'),
('e9642565-9f25-46e2-8d6a-1cd24328088c', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:16', '2025-12-07 08:35:16'),
('e9c8b2b9-3da2-41c8-a66b-178f96e42f73', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:43', '2025-12-07 08:38:43'),
('ea5b40c6-1f73-44e7-baf9-833d189aa6e9', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:17', '2025-12-07 08:35:17'),
('eaaa95bd-5486-417c-a11d-f39b5ff7094a', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'đi ăn đe', '2025-12-07 06:39:47', '2025-12-07 06:39:47'),
('eb0f5b7d-9107-4ebb-8fdd-4d899cfebfb3', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:11', '2025-12-07 08:35:11'),
('eccb04f3-bbcc-48df-9111-f90f56c474c2', 'bbc2a200-caae-4620-977e-b38af5644e5a', '765ca201-4c19-4c58-bf70-d51962ea5891', '.', '2025-12-08 02:12:41', '2025-12-08 02:12:41'),
('eccd5173-ec4f-4d2e-bc56-8064e2e8c196', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'thôi tôi ko tin', '2025-12-07 09:25:34', '2025-12-07 09:25:34'),
('f0b6e064-6438-4784-8560-f1360e1ceb31', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'sss', '2025-12-07 08:38:45', '2025-12-07 08:38:45'),
('f1010e5a-9249-49c9-b289-0e1330f1ab35', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', '1234566', '2025-12-07 09:07:38', '2025-12-07 09:10:52'),
('f1d7aef1-5d06-4ae3-8930-45651975944b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqweqweqw', '2025-12-07 09:07:41', '2025-12-07 09:07:41'),
('f1fcf840-213e-4e39-9e60-7ae5332b3043', 'bbc2a200-caae-4620-977e-b38af5644e5a', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'gì v', '2025-12-07 08:01:52', '2025-12-07 08:01:52'),
('f2386d7c-50e4-49e9-8772-7c1903d26963', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum', '2025-12-07 06:48:50', '2025-12-07 08:28:20'),
('f2baf75c-ad18-4755-be14-4a9c110ce3d8', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'dá', '2025-12-07 08:35:04', '2025-12-07 08:35:04'),
('f3b236cf-5a11-4f44-8974-b71bc98a61f4', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'hehe', '2025-12-07 09:02:17', '2025-12-07 09:02:17'),
('f3c84d84-3c4a-4ea3-a3b0-11c2e64ed8bd', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '7', '2025-12-07 08:42:40', '2025-12-07 08:42:40'),
('f46f320b-7219-4c34-aa4e-4b3d70bacbc2', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qư', '2025-12-07 08:35:11', '2025-12-07 08:35:11'),
('f7367344-78de-44d3-83f6-bd9aee5a11ab', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:14', '2025-12-07 08:35:14'),
('f775e92c-8d91-4f63-b152-8f19460c661b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'a', '2025-12-07 09:05:08', '2025-12-07 09:05:08'),
('f9128c5f-876d-4c5d-93c0-9d9e9253090b', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:44', '2025-12-07 08:38:44'),
('f9a5f177-1419-4545-9637-6ff788029fcd', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2', '2025-12-07 08:42:52', '2025-12-07 08:42:52'),
('fae96e74-03b2-4e6c-8238-4d7323eab8b8', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'eqư', '2025-12-07 08:35:14', '2025-12-07 08:35:14'),
('fb87dddb-b05f-4b85-96b2-259b6d9bdbd4', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'tuyệt cà là vời', '2025-12-07 09:02:35', '2025-12-07 09:02:35'),
('fbd2d486-4364-4665-b95f-fd9c7ac71e4d', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'e', '2025-12-07 08:35:09', '2025-12-07 08:35:09'),
('fe3281d3-dbef-475f-a517-36493060c587', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 'dqwd', '2025-12-07 08:41:28', '2025-12-07 08:41:28'),
('feb0e6e5-e248-4261-9f19-5c08d4afcc17', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'qưeq', '2025-12-07 08:35:17', '2025-12-07 08:35:17'),
('ffb70b37-0b27-4ae1-91a8-31692900eac4', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '765ca201-4c19-4c58-bf70-d51962ea5891', 'dá', '2025-12-07 08:35:03', '2025-12-07 08:35:03'),
('fffa0ce6-4a0c-41db-9539-2a64f90dcf48', '6c1ed396-abb5-410f-93ae-be429b41d9b0', '0f3048f8-f06a-48a9-9165-fae7d964018a', 's', '2025-12-07 08:38:44', '2025-12-07 08:38:44');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `group_message_attachments`
--

CREATE TABLE `group_message_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `group_message_attachments`
--

INSERT INTO `group_message_attachments` (`id`, `message_id`, `filename`, `original_filename`, `file_type`, `file_size`, `file_url`, `created_at`) VALUES
('12605f7a-f72e-4775-9fcb-4cdf475cbca9', 'bc8e6c8f-cfb6-438a-a8fd-a45ad1f42aa3', '3c638536-fb4a-484d-8e26-2f8b49d22406.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 11.45.11â¯CH.png', 'image/png', 817391, 'http://localhost:2222/uploads/group-messages/3c638536-fb4a-484d-8e26-2f8b49d22406.png', '2025-12-07 17:00:29'),
('1c29e494-4079-47fa-b03e-3442f6c3c071', '77161187-f501-4d22-9a74-b1f5f5b9fcad', 'a8fc946d-88f8-42b1-b2c4-20e805a9159c.png', 'AÌnh maÌn hiÌnh 2025-12-08 luÌc 12.39.12â¯SA.png', 'image/png', 357034, 'http://localhost:2222/uploads/group-messages/a8fc946d-88f8-42b1-b2c4-20e805a9159c.png', '2025-12-07 17:55:19'),
('26bd4ed8-eb37-4b6b-8a63-badbfb8295c6', 'c712ca9b-450f-444c-8dde-43fd71f5e1dd', 'b42db8c5-9007-4e5d-88d7-6193767542ea.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 9.22.01â¯SA.png', 'image/png', 1873929, 'http://localhost:2222/uploads/group-messages/b42db8c5-9007-4e5d-88d7-6193767542ea.png', '2025-12-07 17:00:04'),
('28ff29c1-f31e-4e6c-8e72-28ba4090fbc6', 'c712ca9b-450f-444c-8dde-43fd71f5e1dd', '35310422-c142-4626-93af-5ec89c672a71.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 9.01.04â¯CH.png', 'image/png', 558429, 'http://localhost:2222/uploads/group-messages/35310422-c142-4626-93af-5ec89c672a71.png', '2025-12-07 17:00:04'),
('296c98d3-6092-42f2-aedf-86a04e117908', 'bc8e6c8f-cfb6-438a-a8fd-a45ad1f42aa3', '1d250c1d-afbd-4bea-bbe3-638c48a156ad.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 11.28.46â¯SA.png', 'image/png', 341558, 'http://localhost:2222/uploads/group-messages/1d250c1d-afbd-4bea-bbe3-638c48a156ad.png', '2025-12-07 17:00:29'),
('2d035742-6112-43ec-9d8a-125e7c23e22c', '77161187-f501-4d22-9a74-b1f5f5b9fcad', 'f585e14b-46b3-4a38-87d1-00f448a31a17.png', 'AÌnh maÌn hiÌnh 2025-12-08 luÌc 12.28.06â¯SA.png', 'image/png', 690689, 'http://localhost:2222/uploads/group-messages/f585e14b-46b3-4a38-87d1-00f448a31a17.png', '2025-12-07 17:55:19'),
('50aa0570-2381-4591-88b5-00a46787683c', 'c4dac7a5-ebe7-483f-9fc3-f779f2e4bfba', 'e84dc2c7-db6d-464f-8555-11b955de6073.png', 'image.png', 'image/png', 131297, 'http://localhost:2222/uploads/group-messages/e84dc2c7-db6d-464f-8555-11b955de6073.png', '2025-12-07 06:39:57'),
('58b6ad02-1941-4811-927f-a1376f003a7b', 'b1df28b1-7798-4902-b5bc-751f364c8274', '8c59e188-ad60-4ed1-b731-166834ef05f4.xlsx', 'Danh_sach_vat_tu_20251206_222216 (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/group-messages/8c59e188-ad60-4ed1-b731-166834ef05f4.xlsx', '2025-12-07 10:18:25'),
('63ae489d-755b-4952-bad3-4f7c39460f37', 'b1df28b1-7798-4902-b5bc-751f364c8274', '6b3f7d38-8991-4918-9b26-02facfba5e90.xlsx', 'Danh_sach_vat_tu_20251206_222216.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/group-messages/6b3f7d38-8991-4918-9b26-02facfba5e90.xlsx', '2025-12-07 10:18:25'),
('7b38d3f2-054d-41f2-b76b-b4c05622f10c', 'bc8e6c8f-cfb6-438a-a8fd-a45ad1f42aa3', '5e4e6b9e-eb6b-46e0-9944-1923abe39e0f.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 9.41.30â¯SA.png', 'image/png', 342621, 'http://localhost:2222/uploads/group-messages/5e4e6b9e-eb6b-46e0-9944-1923abe39e0f.png', '2025-12-07 17:00:29'),
('884479fc-7684-4dc0-b0e5-65ad243a95f3', 'c712ca9b-450f-444c-8dde-43fd71f5e1dd', '7375a580-17f2-4302-8864-cccfc8650971.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 1.13.51â¯SA.png', 'image/png', 4109327, 'http://localhost:2222/uploads/group-messages/7375a580-17f2-4302-8864-cccfc8650971.png', '2025-12-07 17:00:04'),
('987500f9-0b48-4e9f-8186-dbf626a31de2', 'bc8e6c8f-cfb6-438a-a8fd-a45ad1f42aa3', '311664e3-9ecb-4d54-aba8-9db206a3497f.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 11.25.15â¯SA.png', 'image/png', 348449, 'http://localhost:2222/uploads/group-messages/311664e3-9ecb-4d54-aba8-9db206a3497f.png', '2025-12-07 17:00:29'),
('996aad1a-0d30-44f4-9d4d-2501df9a730e', '673c9001-51dd-45b8-ad18-793818277fdc', 'c59faa60-1a19-4f5d-a51e-aaf93e3d875f.jpeg', 'cfb7df12-2000-4094-9b50-b5e059ba2648.jpeg', 'image/jpeg', 160859, 'http://localhost:2222/uploads/group-messages/c59faa60-1a19-4f5d-a51e-aaf93e3d875f.jpeg', '2025-12-07 10:17:24'),
('a5172290-4413-46dc-bb22-6d9059588fdc', 'c712ca9b-450f-444c-8dde-43fd71f5e1dd', '0989a54e-937d-44e9-90f0-c559c9c9ffdb.png', 'AÌnh maÌn hiÌnh 2025-12-06 luÌc 11.35.23â¯CH.png', 'image/png', 10541, 'http://localhost:2222/uploads/group-messages/0989a54e-937d-44e9-90f0-c559c9c9ffdb.png', '2025-12-07 17:00:04'),
('b1615caf-7f2e-4b79-afdc-157aa3961588', '673c9001-51dd-45b8-ad18-793818277fdc', 'a96d3527-0bee-47ec-9ce4-12e7890f27b2.png', 'image.png', 'image/png', 131297, 'http://localhost:2222/uploads/group-messages/a96d3527-0bee-47ec-9ce4-12e7890f27b2.png', '2025-12-07 10:17:24'),
('bcdb2813-1bfd-4afa-ab2a-a71d8e92675b', '52779f2c-b57a-4d70-a968-5951bf0da9ed', 'b21c44f3-5628-4b55-8ee0-c39deccb65d8.xlsx', '00059dcd-beb3-4f4f-a476-82b667246fe2 (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/group-messages/b21c44f3-5628-4b55-8ee0-c39deccb65d8.xlsx', '2025-12-07 10:18:14'),
('c22c9e62-4103-458e-990f-3f7956bc2ff8', 'c712ca9b-450f-444c-8dde-43fd71f5e1dd', 'f606ad1a-9650-4f92-83e2-5d69683d946b.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 9.41.30â¯SA.png', 'image/png', 342621, 'http://localhost:2222/uploads/group-messages/f606ad1a-9650-4f92-83e2-5d69683d946b.png', '2025-12-07 17:00:04'),
('c9c877d1-c07d-44bc-938f-fff8e4d44a93', 'bc8e6c8f-cfb6-438a-a8fd-a45ad1f42aa3', 'dbe65927-42a6-4128-935b-7e3cc0bc26f0.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 10.19.44â¯CH.png', 'image/png', 53744, 'http://localhost:2222/uploads/group-messages/dbe65927-42a6-4128-935b-7e3cc0bc26f0.png', '2025-12-07 17:00:29'),
('ce5c601a-ffb5-46f5-81c1-bcbd0ea1a64e', '52779f2c-b57a-4d70-a968-5951bf0da9ed', 'a3d7a27e-827f-42cd-bfce-bf90cd75372f.xlsx', '00059dcd-beb3-4f4f-a476-82b667246fe2.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/group-messages/a3d7a27e-827f-42cd-bfce-bf90cd75372f.xlsx', '2025-12-07 10:18:14'),
('cec46ed7-ba73-46d8-8513-1f6b419710e1', '52779f2c-b57a-4d70-a968-5951bf0da9ed', 'a9403c38-4e85-407f-b182-fd08aae14572.xlsx', '31d2d1fe-df64-4d27-bb20-eea53177e67e.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 19183, 'http://localhost:2222/uploads/group-messages/a9403c38-4e85-407f-b182-fd08aae14572.xlsx', '2025-12-07 10:18:14'),
('db012de0-d076-46a5-8bd7-75e5875fd31d', '77161187-f501-4d22-9a74-b1f5f5b9fcad', 'eb611e40-15c1-4525-92ab-db4d8fd46831.png', 'AÌnh maÌn hiÌnh 2025-12-08 luÌc 12.39.07â¯SA.png', 'image/png', 317990, 'http://localhost:2222/uploads/group-messages/eb611e40-15c1-4525-92ab-db4d8fd46831.png', '2025-12-07 17:55:19'),
('e5484158-cc7e-432a-bc09-59be59101588', 'bc8e6c8f-cfb6-438a-a8fd-a45ad1f42aa3', 'f45a0ed4-b6eb-4e1c-9184-31d0afebe98c.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 11.47.15â¯CH.png', 'image/png', 176647, 'http://localhost:2222/uploads/group-messages/f45a0ed4-b6eb-4e1c-9184-31d0afebe98c.png', '2025-12-07 17:00:29'),
('f03033e6-ca47-4266-a36a-c86e75f16eb6', 'bc8e6c8f-cfb6-438a-a8fd-a45ad1f42aa3', 'ecb0a0b2-3e67-410c-9a24-d63eca51ad18.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 11.45.17â¯CH.png', 'image/png', 62354, 'http://localhost:2222/uploads/group-messages/ecb0a0b2-3e67-410c-9a24-d63eca51ad18.png', '2025-12-07 17:00:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `group_typing_indicators`
--

CREATE TABLE `group_typing_indicators` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_typing` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `materials`
--

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
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `materials`
--

INSERT INTO `materials` (`id`, `code`, `name`, `type`, `category`, `unit`, `current_stock`, `import_price`, `min_stock`, `max_stock`, `unit_price`, `supplier`, `location`, `barcode`, `qr_code`, `status`, `created_at`, `updated_at`) VALUES
('13493bf3-8c2d-4001-af0d-1218f6ee77c9', '13493BF3', 'Hồ Hiển Chí', 'import', 'import', 'Cái', 11.000, 10.00, 0.000, 0.000, 10.00, 'Không Biết', NULL, NULL, NULL, 'available', '2025-12-07 05:02:31', '2025-12-07 05:02:31'),
('34937cf8-a871-4582-89e2-42c800cc0dbc', 'Thép', 'Thép', 'Thép', 'Thép', 'Tấn', 5751.364, 3333333.00, 113213.000, 312312.000, 3333333.00, 'Hoà Phát', 'Ha Noi', NULL, NULL, 'available', '2025-12-06 05:13:01', '2025-12-07 15:08:19'),
('410b16f3-0224-45c8-9195-982806a37ce4', '410B16F3', '1222', '1', '1', '1', 2222222.000, 111.00, 0.000, 0.000, 111.00, '11', NULL, NULL, NULL, 'available', '2025-12-06 11:24:28', '2025-12-06 16:02:15'),
('80b07575-854d-4dee-9480-a43178d81200', '80B07575', 'Kim cương', 'Đá quý', '1', 'Cái', 111.000, 111.00, 0.000, 0.000, 111.00, '111', NULL, NULL, NULL, 'available', '2025-12-06 14:22:30', '2025-12-07 15:08:19'),
('cb977c4f-c992-47e5-9b8a-7937c035705e', 'B10', 'Sắt', 'Sắt', 'Sắt', 'Tấn', 77761.818, 1000000.00, 22222.000, 1000.000, 1000000.00, 'Hoà Phát', NULL, NULL, NULL, 'available', '2025-12-06 03:20:09', '2025-12-07 04:06:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `material_transactions`
--

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
  `attachment` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `material_transactions`
--

INSERT INTO `material_transactions` (`id`, `material_id`, `material_name`, `type`, `quantity`, `unit`, `project_id`, `project_name`, `reason`, `performed_by`, `performed_at`, `attachment`) VALUES
('2f8da17c-8f5f-47e0-a60d-443fed135981', '34937cf8-a871-4582-89e2-42c800cc0dbc', 'Thép', 'import', 1.000, 'Tấn', 'b03877ae-83a6-4849-9c80-a8a6ee054377', 'Thi công quốc lộ 1A', '111', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:02:52', NULL),
('7895c641-2005-4533-b8d7-a392ea68e015', '34937cf8-a871-4582-89e2-42c800cc0dbc', 'Thép', 'import', 1.000, 'Tấn', '6a13d549-1f2b-4096-a561-d72c84abee1c', 'Xây trường học', '1', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 04:05:34', NULL),
('aa2a81c9-0723-4ea3-a210-52570e01b6de', '34937cf8-a871-4582-89e2-42c800cc0dbc', 'Thép', 'export', 22.000, 'Tấn', '6a13d549-1f2b-4096-a561-d72c84abee1c', 'Xây trường học', '2', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 07:58:49', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `projects`
--

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
  `progress` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `budget` decimal(15,2) NOT NULL DEFAULT '0.00',
  `actual_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `manager_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Đang đổ dữ liệu cho bảng `projects`
--

INSERT INTO `projects` (`id`, `code`, `name`, `description`, `investor`, `contact_person`, `client`, `location`, `start_date`, `end_date`, `status`, `progress`, `budget`, `actual_cost`, `manager_id`, `created_at`, `updated_at`) VALUES
('23dd9abe-49cc-4bee-9f36-ca7304667a29', '23DD9ABE', 'Dự án nghìn tỏi', '2', 'Hie Ho', 'Tôi', 'Hie Ho', 'Ha Noi', '2025-12-10', '2025-12-25', 'on_hold', 22, 222222.00, 0.00, '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-06 11:25:24', '2025-12-06 18:07:19'),
('6a13d549-1f2b-4096-a561-d72c84abee1c', 'CB1981', 'Xây trường học', 'Xây trường học', 'Hie Ho', 'abc', 'Hie Ho', 'Ha Noi', '2025-12-16', '2025-12-31', 'completed', 50, 23000000.00, 0.00, '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 03:13:37', '2025-12-06 15:50:30'),
('846c920c-8455-498b-9fc2-fd5d1fff3908', 'DA1', 'Xây biệt thự', 'Xây biệt thự', 'Hie Ho', 'Admin', 'Hie Ho', 'Ha Noi', '2025-12-06', '2025-12-31', 'design_consulting', 56, 123021323.00, 0.00, '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 04:04:44', '2025-12-06 13:44:29'),
('86da80b6-039b-42cd-9a34-fad848b5ed60', '01', 'Xây nhà cao tầng', '....', 'Hie Ho', '111', 'Hie Ho', 'Ha Noi', '2025-12-12', '2026-12-18', 'contract_signed_in_progress', 19, 100000000.00, 0.00, '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 09:18:58', '2025-12-06 12:55:53'),
('b03877ae-83a6-4849-9c80-a8a6ee054377', 'MS101312', 'Thi công quốc lộ 1A', 'Thi công quốc lộ 1A', 'Hie Ho', 'hiendzvloen', 'Hie Ho', 'Ha Noi', '2025-12-11', '2025-12-31', 'quoting', 0, 3123213123.00, 0.00, '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 03:00:36', '2025-12-06 15:50:18'),
('b764fb63-a0fc-4443-9731-e6488c8886d3', 'B764FB63', 'Xây landmark ', 'okela', 'Hie Ho', 'hiendzvloen', 'Hie Ho', 'Ha Noi', '2025-12-12', '2025-12-24', 'preparing_acceptance', 22, 100000000.00, 0.00, '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 13:58:55', '2025-12-07 01:49:40'),
('c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'C81D7E45', 'Hồ Hiển Chí', '11', 'Hie Ho', '111', 'Hie Ho', 'Ha Noi', '2025-12-18', '2025-12-18', 'failed', 1, 1110.00, 0.00, '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:01:37', '2025-12-07 14:29:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_comments`
--

CREATE TABLE `project_comments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('contract','project_files') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'contract = Hợp đồng, project_files = Hồ sơ dự án',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung comment',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `project_comments`
--

INSERT INTO `project_comments` (`id`, `project_id`, `category`, `content`, `created_by`, `created_at`, `updated_at`) VALUES
('0486e1dd-1057-410c-8503-f1c229665c5f', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'project_files', 'helo', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 02:56:52', '2025-12-07 02:56:52'),
('15d9ca99-9376-4941-817b-c273a7150599', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', '😂', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 02:55:08', '2025-12-07 02:55:08'),
('1a22332d-67b3-46ac-89d7-19a35d3d7d92', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'project_files', '', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 02:57:04', '2025-12-07 02:57:04'),
('2523a3e5-27e9-4390-b1cc-645b6592ac4b', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'project_files', '2', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:02:05', '2025-12-07 05:02:05'),
('3d451a03-52de-4090-b037-e483607b68a9', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', 'hi', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 02:49:32', '2025-12-07 02:49:32'),
('42461ce1-c71a-4bd2-9c4b-aadc1e79a64d', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'project_files', 'đwqd', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 08:27:15', '2025-12-07 08:27:15'),
('42d1c8dd-5c6c-4946-9104-d7d553493a7c', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'project_files', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 08:07:16', '2025-12-07 08:27:23'),
('58c0e957-f055-4cae-9c21-e21649e4adeb', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'project_files', '', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:02:12', '2025-12-07 05:02:12'),
('5a07085b-6fba-4457-851d-46a3d920d0d3', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', 'alo 111', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 02:42:56', '2025-12-07 02:45:10'),
('6a9d8b38-7b61-4c13-aeec-a58cadb57b1c', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'project_files', 'sao thế nhỉ', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 08:06:59', '2025-12-07 08:06:59'),
('7ad476c6-6d56-4911-b85b-93e97d83d7a4', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', '', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 02:04:46', '2025-12-07 02:04:46'),
('7bd38ae4-69ab-4367-b8c0-31456c6ddd60', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', '🫠', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 03:14:17', '2025-12-07 03:14:17'),
('8773931b-a472-46ef-bc56-78b11a92120f', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', 'ngon choét chưa kkk, cũng bình thường thôi hâhhahaahah', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 02:04:26', '2025-12-07 03:13:54'),
('8878100f-b5d1-43ed-a73a-f8e26a81f0f1', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'contract', '', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:01:57', '2025-12-07 05:01:57'),
('91611e32-7200-4c11-b26a-b33ac568ce5e', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'contract', '1', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:01:49', '2025-12-07 05:01:49'),
('97525dab-73cb-483b-97b0-8b5490e5e5b2', '23dd9abe-49cc-4bee-9f36-ca7304667a29', 'contract', '=)))', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 02:57:50', '2025-12-07 02:57:50'),
('98502a4d-55c4-4c98-8139-1c62028f078d', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'contract', 'alo', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 08:06:48', '2025-12-07 08:06:48'),
('999eeb65-b527-406a-b75b-148e4c061089', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', '', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 02:47:22', '2025-12-07 02:47:22'),
('a35cf839-b8d4-4d62-a9e7-a03da9ef6dd3', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', '😉', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 02:55:01', '2025-12-07 02:55:01'),
('a580b514-574a-4cc3-93c9-f0da81273f98', '23dd9abe-49cc-4bee-9f36-ca7304667a29', 'contract', '', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 02:57:56', '2025-12-07 02:57:56'),
('ebc59bbc-292f-46cd-a01d-33339d2b8a1b', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'contract', '', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 02:05:13', '2025-12-07 02:05:13'),
('f446e4b8-c175-41a9-b686-6a553c3037fb', 'c81d7e45-c754-4c32-9602-6a5f3ccf2c3b', 'project_files', 'láo nháo', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 09:16:53', '2025-12-07 09:16:53'),
('f7fd596f-8e17-4918-abc0-9391ea989ba8', 'b764fb63-a0fc-4443-9731-e6488c8886d3', 'project_files', '???😊', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 02:57:33', '2025-12-07 02:57:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_requests`
--

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
  `approved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `purchase_requests`
--

INSERT INTO `purchase_requests` (`id`, `material_id`, `project_id`, `material_name`, `quantity`, `unit`, `reason`, `requested_by`, `requested_at`, `status`, `approved_by`, `approved_at`) VALUES
('11255282-d5ee-4d4f-93c1-d395a7f2977b', '34937cf8-a871-4582-89e2-42c800cc0dbc', 'b03877ae-83a6-4849-9c80-a8a6ee054377', 'Thép', 2222.000, 'cái', 'cần mua', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 05:43:10', 'pending', NULL, NULL),
('817e700d-0761-48be-b8e7-3da7239d7727', 'cb977c4f-c992-47e5-9b8a-7937c035705e', '6a13d549-1f2b-4096-a561-d72c84abee1c', 'Sắt', 11.000, 'Tấn', 'alo', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 03:20:03', 'rejected', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 03:41:29'),
('9b2273ca-581c-4fed-bace-54749e7dceb5', '410b16f3-0224-45c8-9195-982806a37ce4', '6a13d549-1f2b-4096-a561-d72c84abee1c', '1222', 1.000, '1', '1', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:03:13', 'approved', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:03:44'),
('9f3a3cac-8cf6-415f-8e23-bf6b28541c80', '34937cf8-a871-4582-89e2-42c800cc0dbc', '86da80b6-039b-42cd-9a34-fad848b5ed60', 'Thép', 1.000, 'Tấn', 'ko', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 06:33:08', 'approved', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 03:40:22'),
('d4bb597e-590e-408e-ae00-5057841d7018', '34937cf8-a871-4582-89e2-42c800cc0dbc', NULL, 'Thép', 22222.000, 'cái', '11111', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 05:42:13', 'approved', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-06 05:42:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_request_comments`
--

CREATE TABLE `purchase_request_comments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_request_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung comment',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `purchase_request_comments`
--

INSERT INTO `purchase_request_comments` (`id`, `purchase_request_id`, `content`, `created_by`, `created_at`, `updated_at`) VALUES
('2563853b-2315-4f52-8de2-7d2d000d8369', '9f3a3cac-8cf6-415f-8e23-bf6b28541c80', 'mua làm gi', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 03:29:03', '2025-12-07 03:29:03'),
('37e39051-5e23-4312-b034-1cddd29ce301', '11255282-d5ee-4d4f-93c1-d395a7f2977b', 'mua cái này làm chi', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 03:32:30', '2025-12-07 03:32:30'),
('6302a6f3-e137-47d0-963b-fc3e9919206f', '817e700d-0761-48be-b8e7-3da7239d7727', 'ko mua đâu', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 03:33:34', '2025-12-07 03:33:34'),
('6637fa14-2be8-472a-a361-3becc470de67', '9f3a3cac-8cf6-415f-8e23-bf6b28541c80', '', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 03:39:37', '2025-12-07 03:39:37'),
('6a23bd45-0eff-4d74-b1f2-bdfff9e81e29', '11255282-d5ee-4d4f-93c1-d395a7f2977b', '', '765ca201-4c19-4c58-bf70-d51962ea5891', '2025-12-07 03:31:30', '2025-12-07 03:31:30'),
('7b249642-fc7e-4183-899c-4942e0fab0ab', '9b2273ca-581c-4fed-bace-54749e7dceb5', 'gì thế nhỉ1', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 09:18:06', '2025-12-07 09:18:22'),
('e7104a5e-f75e-4ab3-a2d8-5387fa507e4a', '9b2273ca-581c-4fed-bace-54749e7dceb5', '', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:03:26', '2025-12-07 05:03:26'),
('fe858b61-8a2c-4284-b716-71ae4712422d', '9b2273ca-581c-4fed-bace-54749e7dceb5', '211123123213213', '0f3048f8-f06a-48a9-9165-fae7d964018a', '2025-12-07 05:03:20', '2025-12-07 09:18:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_request_comment_attachments`
--

CREATE TABLE `purchase_request_comment_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `purchase_request_comment_attachments`
--

INSERT INTO `purchase_request_comment_attachments` (`id`, `comment_id`, `filename`, `original_filename`, `file_type`, `file_size`, `file_url`, `created_at`) VALUES
('9f46de17-5829-44ba-8078-7ba1ca87372c', 'e7104a5e-f75e-4ab3-a2d8-5387fa507e4a', '450334ad-acdb-4e8a-a6a4-7b53aab7ce71.xlsx', 'Danh_sach_vat_tu_20251206_222216 (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/purchase-request-comments/450334ad-acdb-4e8a-a6a4-7b53aab7ce71.xlsx', '2025-12-07 05:03:26'),
('b0e85f21-642f-4589-84e9-d2cc0cb17a79', '6637fa14-2be8-472a-a361-3becc470de67', '7054d234-bd98-440c-a4c0-ea75565d43aa.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 12.14.12â¯SA.png', 'image/png', 4268266, 'http://localhost:2222/uploads/purchase-request-comments/7054d234-bd98-440c-a4c0-ea75565d43aa.png', '2025-12-07 03:39:37'),
('b5dc50f5-72f7-4313-962f-b9fd204f84c4', 'e7104a5e-f75e-4ab3-a2d8-5387fa507e4a', 'e61631e5-293c-42fd-a443-39397c54e6b1.xlsx', 'Danh_sach_vat_tu_20251206_222216.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/purchase-request-comments/e61631e5-293c-42fd-a443-39397c54e6b1.xlsx', '2025-12-07 05:03:26'),
('e5e7cd80-75f4-4ec1-982d-eba88ce97da9', '6a23bd45-0eff-4d74-b1f2-bdfff9e81e29', '7faa3944-6d25-4db8-8a27-d43d6d8ae393.png', 'AÌnh maÌn hiÌnh 2025-12-07 luÌc 9.41.30â¯SA.png', 'image/png', 342621, 'http://localhost:2222/uploads/purchase-request-comments/7faa3944-6d25-4db8-8a27-d43d6d8ae393.png', '2025-12-07 03:31:30');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên vai trò (ví dụ: admin, director, project_manager)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả vai trò',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý các vai trò trong hệ thống';

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'Quản trị viên - Toàn quyền', '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('00000000-0000-0000-0000-000000000002', 'director', 'Giám đốc', '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('00000000-0000-0000-0000-000000000003', 'project_manager', 'Quản lý dự án', '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('00000000-0000-0000-0000-000000000004', 'design_department', 'Phòng thiết kế', '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('00000000-0000-0000-0000-000000000005', 'construction_department', 'Phòng thi công', '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('00000000-0000-0000-0000-000000000006', 'accountant', 'Kế toán', '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('00000000-0000-0000-0000-000000000007', 'qs', 'QS - Quantity Surveyor', '2025-12-06 15:34:52', '2025-12-06 15:34:52');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID của vai trò',
  `permission_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại quyền: view_drawing, view_contract, view_daily_report, view_project_report',
  `allowed` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Có được phép hay không (TRUE/FALSE)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý quyền của từng vai trò';

--
-- Đang đổ dữ liệu cho bảng `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_type`, `allowed`, `created_at`, `updated_at`) VALUES
('1bae9b80-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000001', 'view_drawing', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1bae9e0a-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000001', 'view_contract', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1bae9f2c-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000001', 'view_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1bae9ffe-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000001', 'view_daily_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baea0c6-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000001', 'view_project_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baeb44e-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000002', 'view_drawing', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baeb5f2-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000002', 'view_contract', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baeb6ce-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000002', 'view_daily_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baeb7a0-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000002', 'view_project_report', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baeb872-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000003', 'view_drawing', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baeb93a-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000003', 'view_contract', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baeba0c-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000003', 'view_daily_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baebade-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000003', 'view_project_report', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baebbba-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000004', 'view_drawing', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baebcd2-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000004', 'view_contract', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baebda4-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000004', 'view_daily_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baebf3e-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000004', 'view_project_report', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baec024-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000005', 'view_drawing', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baec100-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000005', 'view_contract', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baec1dc-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000005', 'view_daily_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baec2c2-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000005', 'view_project_report', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baede74-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000006', 'view_drawing', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baee108-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000006', 'view_contract', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baee252-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000006', 'view_daily_report', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baee356-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000006', 'view_project_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baee446-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000007', 'view_drawing', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baee536-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000007', 'view_contract', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baee630-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000007', 'view_daily_report', 0, '2025-12-06 15:34:52', '2025-12-06 15:34:52'),
('1baee720-d2b9-11f0-99d2-3d9430326a80', '00000000-0000-0000-0000-000000000007', 'view_project_report', 1, '2025-12-06 15:34:52', '2025-12-06 15:34:52');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `transaction_attachments`
--

CREATE TABLE `transaction_attachments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type',
  `file_size` bigint NOT NULL COMMENT 'Size in bytes',
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `transaction_attachments`
--

INSERT INTO `transaction_attachments` (`id`, `transaction_id`, `filename`, `original_filename`, `file_type`, `file_size`, `file_url`, `created_at`) VALUES
('034eef40-22cb-4454-a254-ce0e6e7d477a', '7895c641-2005-4533-b8d7-a392ea68e015', 'ed404a14-057e-40ac-876b-dfe75d535ca6.jpeg', 'so_do_to_chuc.jpeg', 'image/jpeg', 58227, 'http://localhost:2222/uploads/transactions/ed404a14-057e-40ac-876b-dfe75d535ca6.jpeg', '2025-12-07 04:24:14'),
('0bd50025-e8ac-44c2-a625-184af96421d0', '7895c641-2005-4533-b8d7-a392ea68e015', '00059dcd-beb3-4f4f-a476-82b667246fe2.xlsx', 'Danh_sach_vat_tu_20251206_222216.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/transactions/00059dcd-beb3-4f4f-a476-82b667246fe2.xlsx', '2025-12-07 04:12:09'),
('1b5d68a0-284a-42b7-85a7-3da7b86b47a4', 'aa2a81c9-0723-4ea3-a210-52570e01b6de', 'd735f00f-aa83-4934-b701-ef682b3ee980.png', 'png-clipart-minecraft-pixel-art-graphics-minecraft-gun-mod-angle-bead.png', 'image/png', 2735, 'http://localhost:2222/uploads/transactions/d735f00f-aa83-4934-b701-ef682b3ee980.png', '2025-12-07 07:58:49'),
('3779ddcf-e902-4a3a-8ea4-5f77ffb40062', '2f8da17c-8f5f-47e0-a60d-443fed135981', '40a73130-073f-40f1-96a1-3afcd073fec3.xlsx', 'Danh_sach_vat_tu_20251206_222216 (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/transactions/40a73130-073f-40f1-96a1-3afcd073fec3.xlsx', '2025-12-07 05:02:52'),
('456dab03-604c-4424-b98d-98ab49443de2', '2f8da17c-8f5f-47e0-a60d-443fed135981', '4f817dbc-4c84-4e0e-8c02-8560d9a0cc01.jpeg', 'so_do_to_chuc.jpeg', 'image/jpeg', 58227, 'http://localhost:2222/uploads/transactions/4f817dbc-4c84-4e0e-8c02-8560d9a0cc01.jpeg', '2025-12-07 05:02:52'),
('56d17944-c0f9-4ce7-b101-554f82e469d4', '7895c641-2005-4533-b8d7-a392ea68e015', '0352fd72-a87e-41b8-afea-f224a86f08dc.png', 'png-clipart-minecraft-pixel-art-graphics-minecraft-gun-mod-angle-bead.png', 'image/png', 2735, 'http://localhost:2222/uploads/transactions/0352fd72-a87e-41b8-afea-f224a86f08dc.png', '2025-12-07 04:24:14'),
('61e20a3e-f238-4ee3-a388-bb347e32c6f4', 'aa2a81c9-0723-4ea3-a210-52570e01b6de', '217ba853-081f-4406-a5ed-3e30a312db5d.jpeg', 'so_do_to_chuc.jpeg', 'image/jpeg', 58227, 'http://localhost:2222/uploads/transactions/217ba853-081f-4406-a5ed-3e30a312db5d.jpeg', '2025-12-07 07:58:49'),
('6da053fb-fccc-4de2-b8b9-2ae4bdce691c', '7895c641-2005-4533-b8d7-a392ea68e015', '8092edf1-19ed-439e-a546-11e6f7f011cf.xlsx', 'Danh_sach_du_an.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 19183, 'http://localhost:2222/uploads/transactions/8092edf1-19ed-439e-a546-11e6f7f011cf.xlsx', '2025-12-07 04:12:09'),
('afccc4f4-85af-4700-bd2a-03a39e0d8e5f', '2f8da17c-8f5f-47e0-a60d-443fed135981', '93174ed6-ae0e-4877-8c6b-d5eaeacb0732.xlsx', 'Danh_sach_vat_tu_20251206_222216.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 17080, 'http://localhost:2222/uploads/transactions/93174ed6-ae0e-4877-8c6b-d5eaeacb0732.xlsx', '2025-12-07 05:02:52'),
('b447efd4-adcc-452c-9741-c285490b1f29', 'aa2a81c9-0723-4ea3-a210-52570e01b6de', '61bfd9fe-3fd7-4453-baa9-e22cd2536e1a.png', 'image.png', 'image/png', 131297, 'http://localhost:2222/uploads/transactions/61bfd9fe-3fd7-4453-baa9-e22cd2536e1a.png', '2025-12-07 07:58:49'),
('ca89601b-7afa-4974-8774-701c6bf56c3b', '7895c641-2005-4533-b8d7-a392ea68e015', 'a3ef9bc4-8f97-44e6-b71d-25dbb6b4cc86.png', 'image.png', 'image/png', 131297, 'http://localhost:2222/uploads/transactions/a3ef9bc4-8f97-44e6-b71d-25dbb6b4cc86.png', '2025-12-07 04:24:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

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
  `hire_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `code`, `name`, `email`, `phone`, `password_hash`, `status`, `avatar`, `created_at`, `updated_at`, `role`, `team`, `project_id`, `project_name`, `hire_date`) VALUES
('07e6568d-604a-46fe-8f24-5299634c493d', 'ADM-401251', 'admin', 'admin@gmail.com', '0965032472', '$2b$10$llo66wC4tiXfOJvI12./POb6gPX0poM3KHG.PwB2aTw4.WImtcAZ2', 'on_leave', NULL, '2025-12-07 08:00:01', '2025-12-07 08:00:01', '00000000-0000-0000-0000-000000000005', NULL, 'b03877ae-83a6-4849-9c80-a8a6ee054377', 'Thi công quốc lộ 1A', '2025-12-07'),
('0f3048f8-f06a-48a9-9165-fae7d964018a', NULL, 'Phạm Thế Hiển', 'phamthehien23032003@gmail.com', '0965032472', '$2b$10$aSq44NRwHoGuqTwMqHqTu.ZJvrNsBd4ADbz7hDuBh7c/MQDzuTkMi', 'active', 'c8818ac0-e94d-49fe-8945-97ef23ad604e.png', '2025-12-06 03:33:20', '2025-12-07 17:27:39', '00000000-0000-0000-0000-000000000001', NULL, '86da80b6-039b-42cd-9a34-fad848b5ed60', 'Xây nhà cao tầng', NULL),
('6843c1de-9b50-40d1-8eca-9990c2b701c2', NULL, 'Son lê', 'son@gmail.com', '0968686024', '$2b$10$M66MgvmTbJe0K41kJOXUTOx3..PBMVh/U74kIhq87GPGcdo3pGE96', 'active', 'e8f0c3c4-85d7-4fe9-9617-0f8de9611708.png', '2025-12-06 09:09:00', '2025-12-06 17:34:51', '00000000-0000-0000-0000-000000000005', NULL, 'b03877ae-83a6-4849-9c80-a8a6ee054377', 'Thi công quốc lộ 1A', NULL),
('765ca201-4c19-4c58-bf70-d51962ea5891', 'MS01', 'Hồ Hiển Chí', 'hienxu88.hp@gmail.com', '0965032472', '$2b$10$vjd0NKdD44SHKcz4ZNOfBuwvHHQgnA5CNS.B5.HI9zhoG61iGen3i', 'active', '5a069305-d84c-4579-a58a-309e55760025.jpeg', '2025-12-06 02:34:30', '2025-12-07 02:08:01', '00000000-0000-0000-0000-000000000006', 'Chưa có', 'b03877ae-83a6-4849-9c80-a8a6ee054377', 'Thi công quốc lộ 1A', '2025-12-06'),
('81d0aa95-8dce-4e96-89ed-4fd3b579de3e', 'NAM-854451', 'nam', 'nam@gmai.com', '123456677788', '$2b$10$1G5JwHNa/LY2KHNWYPlkxud/kbwCrmXnvCAXfdbpcctKhMTokuj26', 'active', NULL, '2025-12-07 05:04:14', '2025-12-07 07:59:24', '00000000-0000-0000-0000-000000000001', NULL, '846c920c-8455-498b-9fc2-fd5d1fff3908', 'Xây biệt thự', '2025-12-07'),
('b6f5f860-68bc-41aa-a59e-46b4e14c70c1', 'HUY-116825', 'Huyền', 'hienxu87.hp@gmail.com', '123213124', '$2b$10$h8e2/Fe83yEzhzRD/1sOEu5.eDw5pFEdr/CRYj6tKngYgnW1pqIQu', 'active', NULL, '2025-12-06 17:11:56', '2025-12-06 17:11:56', '00000000-0000-0000-0000-000000000006', NULL, '6a13d549-1f2b-4096-a561-d72c84abee1c', 'Xây trường học', '2025-12-07');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `comment_attachments`
--
ALTER TABLE `comment_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comment_id` (`comment_id`);

--
-- Chỉ mục cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_conversation` (`user1_id`,`user2_id`),
  ADD KEY `idx_user1_id` (`user1_id`),
  ADD KEY `idx_user2_id` (`user2_id`),
  ADD KEY `idx_updated_at` (`updated_at`);

--
-- Chỉ mục cho bảng `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_daily_report` (`user_id`,`report_date`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_report_date` (`report_date`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_daily_reports_time_slot` (`time_slot`),
  ADD KEY `idx_daily_reports_location` (`location`);

--
-- Chỉ mục cho bảng `direct_messages`
--
ALTER TABLE `direct_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversation_id` (`conversation_id`),
  ADD KEY `idx_sender_id` (`sender_id`),
  ADD KEY `idx_receiver_id` (`receiver_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `direct_message_attachments`
--
ALTER TABLE `direct_message_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_message_id` (`message_id`);

--
-- Chỉ mục cho bảng `group_chats`
--
ALTER TABLE `group_chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_user` (`group_id`,`user_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_last_read_at` (`last_read_at`),
  ADD KEY `idx_pinned` (`pinned`,`pinned_at`);

--
-- Chỉ mục cho bảng `group_messages`
--
ALTER TABLE `group_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `group_message_attachments`
--
ALTER TABLE `group_message_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_message_id` (`message_id`);

--
-- Chỉ mục cho bảng `group_typing_indicators`
--
ALTER TABLE `group_typing_indicators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_user_typing` (`group_id`,`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_updated_at` (`updated_at`);

--
-- Chỉ mục cho bảng `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `material_transactions`
--
ALTER TABLE `material_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `performed_by` (`performed_by`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_performed_at` (`performed_at`);

--
-- Chỉ mục cho bảng `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_manager_id` (`manager_id`);

--
-- Chỉ mục cho bảng `project_comments`
--
ALTER TABLE `project_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_requested_at` (`requested_at`),
  ADD KEY `idx_project_id` (`project_id`);

--
-- Chỉ mục cho bảng `purchase_request_comments`
--
ALTER TABLE `purchase_request_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_purchase_request_id` (`purchase_request_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `purchase_request_comment_attachments`
--
ALTER TABLE `purchase_request_comment_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comment_id` (`comment_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Chỉ mục cho bảng `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_permission` (`role_id`,`permission_type`),
  ADD KEY `idx_role_id` (`role_id`),
  ADD KEY `idx_permission_type` (`permission_type`);

--
-- Chỉ mục cho bảng `transaction_attachments`
--
ALTER TABLE `transaction_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transaction_id` (`transaction_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_users_role_id` (`role`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_team` (`team`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `comment_attachments`
--
ALTER TABLE `comment_attachments`
  ADD CONSTRAINT `comment_attachments_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `project_comments` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD CONSTRAINT `daily_reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `direct_messages`
--
ALTER TABLE `direct_messages`
  ADD CONSTRAINT `direct_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `direct_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `direct_messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Các ràng buộc cho bảng `direct_message_attachments`
--
ALTER TABLE `direct_message_attachments`
  ADD CONSTRAINT `direct_message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `direct_messages` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `group_chats`
--
ALTER TABLE `group_chats`
  ADD CONSTRAINT `group_chats_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Các ràng buộc cho bảng `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `group_chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `group_messages`
--
ALTER TABLE `group_messages`
  ADD CONSTRAINT `group_messages_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `group_chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Các ràng buộc cho bảng `group_message_attachments`
--
ALTER TABLE `group_message_attachments`
  ADD CONSTRAINT `group_message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `group_messages` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `group_typing_indicators`
--
ALTER TABLE `group_typing_indicators`
  ADD CONSTRAINT `group_typing_indicators_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `group_chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_typing_indicators_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `material_transactions`
--
ALTER TABLE `material_transactions`
  ADD CONSTRAINT `material_transactions_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  ADD CONSTRAINT `material_transactions_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `material_transactions_ibfk_3` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `project_comments`
--
ALTER TABLE `project_comments`
  ADD CONSTRAINT `project_comments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_comments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `purchase_requests_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  ADD CONSTRAINT `purchase_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchase_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchase_requests_ibfk_4` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `purchase_request_comments`
--
ALTER TABLE `purchase_request_comments`
  ADD CONSTRAINT `purchase_request_comments_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_request_comments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `purchase_request_comment_attachments`
--
ALTER TABLE `purchase_request_comment_attachments`
  ADD CONSTRAINT `purchase_request_comment_attachments_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `purchase_request_comments` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `transaction_attachments`
--
ALTER TABLE `transaction_attachments`
  ADD CONSTRAINT `transaction_attachments_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `material_transactions` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
