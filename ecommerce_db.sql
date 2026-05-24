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
('PROD-fdb8f87d', 'iPhone 16', 'Mobile', 5000.00, 11, 'ACTIVE', '2026-05-23 05:39:33', '2026-05-23 11:35:15');

-- --------------------------------------------------------

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
