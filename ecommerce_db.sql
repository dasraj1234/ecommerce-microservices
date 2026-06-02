-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2026 at 07:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `fraud_logs`
--

CREATE TABLE `fraud_logs` (
  `id` bigint(20) NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `risk_score` decimal(5,2) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `idempotency_key` varchar(100) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status`, `payment_id`, `idempotency_key`, `created_date`, `updated_date`) VALUES
('ORD-8d2d191d', 'USER-1001', 5000.00, 'CANCELLED', 'P-0ea427e2', 'IDEMP-6ace0032-5', '2026-05-23 06:07:42', '2026-05-23 11:35:15'),
('ORD-94d30535', 'USER-1001', 6000.00, 'CANCELLED', NULL, 'IDEMP-03e7e5cc-4', '2026-05-23 06:32:01', '2026-05-23 06:32:01');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `item_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `item_price`, `total_price`) VALUES
(1, 'ORD-8d2d191d', 'PROD-fdb8f87d', 1, 5000.00, 5000.00),
(2, 'ORD-94d30535', 'PROD-fdb8f87d', 1, 6000.00, 6000.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_req_res`
--

CREATE TABLE `order_req_res` (
  `id` bigint(20) NOT NULL,
  `order_id` varchar(50) DEFAULT NULL,
  `request_payload` longtext DEFAULT NULL,
  `response_payload` longtext DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_req_res`
--

INSERT INTO `order_req_res` (`id`, `order_id`, `request_payload`, `response_payload`, `status`, `reason`, `created_date`) VALUES
(1, 'ORD-8d2d191d', '{\"userId\":\"USER-1001\",\"productId\":\"PROD-fdb8f87d\",\"quantity\":1,\"totalAmount\":5000.0}', '{\"paymentId\":\"P-0ea427e2\",\"status\":\"SUCCESS\",\"message\":\"Payment successful\"}', 'SUCCESS', 'PAYMENT_SUCCESS', '2026-05-23 06:07:42'),
(2, 'ORD-94d30535', '{\"userId\":\"USER-1001\",\"productId\":\"PROD-fdb8f87d\",\"quantity\":1,\"totalAmount\":6000.0}', '{\"paymentId\":\"P-46b66662\",\"status\":\"FAILED\",\"message\":\"Insufficient wallet balance\"}', 'FAILED', 'Insufficient wallet balance', '2026-05-23 06:32:01'),
(3, 'ORD-94d30535', '{\"userId\":\"USER-1001\",\"productId\":\"PROD-fdb8f87d\",\"quantity\":1,\"totalAmount\":6000.0}', '{}', 'FAILED', 'Insufficient wallet balance', '2026-05-23 06:32:01');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` varchar(50) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL,
  `idempotency_key` varchar(100) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `order_id`, `user_id`, `amount`, `status`, `idempotency_key`, `created_date`, `updated_date`) VALUES
('P-0ea427e2', 'ORD-8d2d191d', 'USER-1001', 5000.00, 'SUCCESS', 'IDEMP-6ace0032-5', '2026-05-23 06:07:42', '2026-05-23 06:07:42'),
('P-445fe154', 'ORD-123', 'USER-1001', 5000.00, 'FAILED', 'IDEMP-123', '2026-05-23 06:40:42', '2026-05-23 06:40:42'),
('P-46b66662', 'ORD-94d30535', 'USER-1001', 6000.00, 'FAILED', 'IDEMP-03e7e5cc-4', '2026-05-23 06:32:01', '2026-05-23 06:32:01'),
('P-df7610b1', 'ORD-xxxx', 'USER-1001', 5000.00, 'SUCCESS', 'IDEMP-xxxx', '2026-05-23 06:28:32', '2026-05-23 06:28:32');

-- --------------------------------------------------------

--
-- Table structure for table `payment_req_res`
--

CREATE TABLE `payment_req_res` (
  `id` bigint(20) NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `request_payload` longtext DEFAULT NULL,
  `response_payload` longtext DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_req_res`
--

INSERT INTO `payment_req_res` (`id`, `payment_id`, `request_payload`, `response_payload`, `status`, `reason`, `created_date`) VALUES
(1, 'P-0ea427e2', 'com.ecommerce.paymentwallet.payment.dto.PaymentRequest@661ead02', 'com.ecommerce.paymentwallet.payment.dto.PaymentResponse@7de6f356', 'SUCCESS', 'PAYMENT_SUCCESS', '2026-05-23 06:07:42'),
(2, 'P-df7610b1', '{\"orderId\":\"ORD-xxxx\",\"userId\":\"USER-1001\",\"amount\":5000.0,\"idempotencyKey\":\"IDEMP-xxxx\"}', '{\"paymentId\":\"P-df7610b1\",\"status\":\"SUCCESS\",\"message\":\"Payment successful\"}', 'SUCCESS', 'PAYMENT_SUCCESS', '2026-05-23 06:28:32'),
(3, 'P-46b66662', '{\"orderId\":\"ORD-94d30535\",\"userId\":\"USER-1001\",\"amount\":6000.0,\"idempotencyKey\":\"IDEMP-03e7e5cc-4\"}', '{\"paymentId\":\"P-46b66662\",\"status\":\"FAILED\",\"message\":\"Insufficient wallet balance\"}', 'FAILED', 'INSUFFICIENT_BALANCE', '2026-05-23 06:32:01'),
(4, 'P-445fe154', '{\"orderId\":\"ORD-123\",\"userId\":\"USER-1001\",\"amount\":5000.0,\"idempotencyKey\":\"IDEMP-123\"}', '{\"paymentId\":\"P-445fe154\",\"status\":\"FAILED\",\"message\":\"Insufficient wallet balance\"}', 'FAILED', 'INSUFFICIENT_BALANCE', '2026-05-23 06:40:42');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `category`, `price`, `stock`, `status`, `created_date`, `updated_date`) VALUES
('PROD-fdb8f87d', 'iPhone 16', 'Mobile', 5000.00, 11, 'ACTIVE', '2026-05-23 05:39:33', '2026-05-23 11:35:15'),
('PROD-1002', 'Samsung Galaxy S24', 'Mobile', 4500.00, 25, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1003', 'Google Pixel 9', 'Mobile', 4000.00, 18, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1004', 'OnePlus 12', 'Mobile', 3800.00, 20, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1005', 'MacBook Pro 14', 'Laptop', 12000.00, 8, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1006', 'Dell XPS 15', 'Laptop', 9500.00, 10, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1007', 'HP Spectre x360', 'Laptop', 8800.00, 12, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1008', 'Lenovo ThinkPad X1', 'Laptop', 9000.00, 9, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1009', 'iPad Air', 'Tablet', 3500.00, 15, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1010', 'Samsung Galaxy Tab S9', 'Tablet', 3200.00, 14, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1011', 'Sony WH-1000XM5', 'Audio', 1500.00, 30, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1012', 'AirPods Pro 2', 'Audio', 1200.00, 40, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1013', 'JBL Flip 6', 'Audio', 600.00, 50, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1014', 'Apple Watch Series 10', 'Wearable', 2000.00, 22, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1015', 'Samsung Galaxy Watch 7', 'Wearable', 1800.00, 19, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1016', 'Fitbit Charge 6', 'Wearable', 900.00, 35, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1017', 'Logitech MX Master 3S', 'Accessories', 400.00, 60, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1018', 'Keychron K2 Keyboard', 'Accessories', 500.00, 45, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1019', 'Anker Power Bank 20000', 'Accessories', 350.00, 70, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00'),
('PROD-1020', 'Samsung 4K Monitor 27', 'Electronics', 2500.00, 16, 'ACTIVE', '2026-05-24 07:00:00', '2026-05-24 07:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`  (owned by auth-user-service)
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
-- Passwords are BCrypt hashes. Plaintext logins (username / password):
--   admin / MYADMIN, user1 / MYUSER1, user2 / MYUSER2, ... user8 / MYUSER8
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `created_at`) VALUES
('a0000000-0000-4000-8000-000000000001', 'admin', '$2b$12$3guzRwAiSqAXK9hMCxjuxu6FhwS20CS0KwOMUgeZ0rwXgHyX9fYdW', 'admin@shop.com', 'ADMIN', '2026-05-24'),
('a0000000-0000-4000-8000-000000000002', 'user1', '$2b$12$EM6VYlnqLtgHK5ZVpY/7jOYTJ2mCnYu20e5gfzG/rxqVq/WYIfpH.', 'user1@shop.com', 'USER', '2026-05-24'),
('a0000000-0000-4000-8000-000000000003', 'user2', '$2b$12$WOOZZI.SH9LLoR7NjhwskeFD/xUpwS9Tkg5QI94YG.wbiIq38zlLS', 'user2@shop.com', 'USER', '2026-05-24'),
('a0000000-0000-4000-8000-000000000004', 'user3', '$2b$12$49uw00DDtlrzo57zkdoL5e3cRcNGLwXT2LmQHD/Ltnbkmna7B7Mwu', 'user3@shop.com', 'USER', '2026-05-24'),
('a0000000-0000-4000-8000-000000000005', 'user4', '$2b$12$Xp0oDAlY4ER8Ia7x1A2iqOMKuNlPDIuDNVBfqT8rzTnS5/yws.wRS', 'user4@shop.com', 'USER', '2026-05-24'),
('a0000000-0000-4000-8000-000000000006', 'user5', '$2b$12$xHIQkvv3alMLGES51.5NfO7Ga4A9ArS1cf7w.SLVYkkJd5apbXcTS', 'user5@shop.com', 'USER', '2026-05-24'),
('a0000000-0000-4000-8000-000000000007', 'user6', '$2b$12$1LUfSUkNxU6wIVmsabRsg.12vO4g/ZNXPUfMb.GKDmM5KlPiBRdMC', 'user6@shop.com', 'USER', '2026-05-24'),
('a0000000-0000-4000-8000-000000000008', 'user7', '$2b$12$jo0ay07UbrPMv63P6CxYL.loz./hHPb0/RDth2/2/5bkKR2oy2K1i', 'user7@shop.com', 'USER', '2026-05-24'),
('a0000000-0000-4000-8000-000000000009', 'user8', '$2b$12$ZGZdBsWOSA54Jd.a176DV.MErAG2zR6y0c/LKplxfzTRxyaahhIMO', 'user8@shop.com', 'USER', '2026-05-24');
--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `txn_id` varchar(50) NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `wallet_id` varchar(50) DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `wallet_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`wallet_id`, `user_id`, `balance`, `status`, `created_date`, `updated_date`) VALUES
('', '', 10000.00, 'ACTIVE', '2026-05-23 06:40:59', '2026-05-23 06:41:10'),
('WALLET-1001', 'USER-1001', 10000.00, 'ACTIVE', '2026-05-23 05:18:32', '2026-05-23 06:41:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `fraud_logs`
--
ALTER TABLE `fraud_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_item_order` (`order_id`),
  ADD KEY `fk_order_item_product` (`product_id`);

--
-- Indexes for table `order_req_res`
--
ALTER TABLE `order_req_res`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`);

--
-- Indexes for table `payment_req_res`
--
ALTER TABLE `payment_req_res`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`txn_id`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`wallet_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `fraud_logs`
--
ALTER TABLE `fraud_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_req_res`
--
ALTER TABLE `order_req_res`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payment_req_res`
--
ALTER TABLE `payment_req_res`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
