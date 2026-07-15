/*
SQLyog Community v13.1.9 (64 bit)
MySQL - 10.4.32-MariaDB : Database - ecommerce_db
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`ecommerce_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `ecommerce_db`;

/*Table structure for table `category_master` */

DROP TABLE IF EXISTS `category_master`;

CREATE TABLE `category_master` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_code` varchar(10) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `parent_category_code` varchar(10) DEFAULT NULL,
  `level_no` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_code` (`category_code`)
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `category_master` */

insert  into `category_master`(`category_id`,`category_code`,`category_name`,`parent_category_code`,`level_no`,`status`,`created_date`,`updated_date`) values 
(1,'1','Electronics',NULL,1,'ACTIVE','2026-07-11 20:16:02','2026-07-11 20:16:02'),
(2,'2','Fashion',NULL,1,'ACTIVE','2026-07-11 20:16:02','2026-07-11 20:16:02'),
(3,'3','Home',NULL,1,'ACTIVE','2026-07-11 20:16:02','2026-07-11 20:16:02'),
(4,'4','Books',NULL,1,'ACTIVE','2026-07-11 20:16:02','2026-07-11 20:16:02'),
(5,'5','Sports',NULL,1,'ACTIVE','2026-07-11 20:16:02','2026-07-11 20:16:02'),
(6,'6','Beauty',NULL,1,'ACTIVE','2026-07-11 20:16:02','2026-07-11 20:16:02'),
(7,'7','Grocery',NULL,1,'ACTIVE','2026-07-11 20:16:02','2026-07-11 20:16:02'),
(8,'8','Stationery',NULL,1,'ACTIVE','2026-07-11 20:16:02','2026-07-11 20:16:02'),
(9,'11','Mobile Phones','1',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(10,'12','Audio','1',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(11,'13','Television','1',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(12,'14','Laptop','1',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(13,'15','Camera','1',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(14,'16','Accessories','1',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(15,'21','Mens Wear','2',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(16,'22','Womens Wear','2',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(17,'23','Kids Wear','2',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(18,'24','Footwear','2',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(19,'31','Furniture','3',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(20,'32','Kitchen Appliances','3',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(21,'33','Home Decor','3',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(22,'41','Educational','4',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(23,'42','Novels','4',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(24,'43','Competitive Exams','4',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(25,'51','Cricket','5',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(26,'52','Football','5',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(27,'53','Gym Equipment','5',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(28,'61','Skin Care','6',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(29,'62','Hair Care','6',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(30,'63','Makeup','6',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(31,'71','Food','7',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(32,'72','Beverages','7',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(33,'73','Personal Care','7',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(34,'81','Writing','8',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(35,'82','Office Supplies','8',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(36,'83','Art Supplies','8',2,'ACTIVE','2026-07-11 20:16:15','2026-07-11 20:16:15'),
(37,'111','Smartphones','11',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(38,'112','Feature Phones','11',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(39,'121','Headphones','12',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(40,'122','Speakers','12',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(41,'123','Earbuds','12',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(42,'131','LED TV','13',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(43,'132','Smart TV','13',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(44,'141','Gaming Laptop','14',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(45,'142','Business Laptop','14',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(46,'151','DSLR','15',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(47,'152','Mirrorless','15',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(48,'161','Chargers','16',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(49,'162','Power Banks','16',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(50,'211','Shirts','21',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(51,'212','T-Shirts','21',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(52,'213','Jeans','21',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(53,'221','Sarees','22',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(54,'222','Kurtis','22',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(55,'223','Western Wear','22',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(56,'231','Kids Clothing','23',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(57,'232','Kids Footwear','23',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(58,'241','Sports Shoes','24',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(59,'242','Casual Shoes','24',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(60,'311','Sofa','31',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(61,'312','Bed','31',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(62,'313','Dining Table','31',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(63,'321','Mixer Grinder','32',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(64,'322','Microwave','32',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(65,'323','Induction Cooktop','32',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(66,'331','Wall Clock','33',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(67,'332','Paintings','33',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(68,'333','Flower Vase','33',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(69,'411','Engineering','41',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(70,'412','Medical','41',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(71,'413','School','41',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(72,'421','Mystery','42',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(73,'422','Sci-Fi','42',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(74,'423','Romance','42',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(75,'431','UPSC','43',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(76,'432','SSC','43',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(77,'433','Banking','43',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(78,'511','Cricket Bat','51',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(79,'512','Cricket Ball','51',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(80,'513','Batting Gloves','51',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(81,'521','Football','52',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(82,'522','Football Shoes','52',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(83,'523','Goalkeeper Gloves','52',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(84,'531','Dumbbells','53',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(85,'532','Treadmill','53',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(86,'533','Exercise Cycle','53',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(87,'611','Face Wash','61',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(88,'612','Moisturizer','61',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(89,'613','Sunscreen','61',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(90,'621','Hair Oil','62',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(91,'622','Shampoo','62',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(92,'623','Conditioner','62',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(93,'631','Lipstick','63',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(94,'632','Foundation','63',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(95,'633','Compact Powder','63',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(96,'711','Rice','71',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(97,'712','Cooking Oil','71',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(98,'713','Atta','71',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(99,'721','Soft Drinks','72',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(100,'722','Fruit Juice','72',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(101,'723','Tea & Coffee','72',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(102,'731','Soap','73',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(103,'732','Toothpaste','73',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(104,'733','Hand Wash','73',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(105,'811','Pens','81',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(106,'812','Pencils','81',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(107,'813','Markers','81',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(108,'821','Files','82',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(109,'822','Printer Paper','82',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(110,'823','Staplers','82',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(111,'831','Water Colours','83',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(112,'832','Sketch Pens','83',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17'),
(113,'833','Canvas','83',3,'ACTIVE','2026-07-11 20:17:17','2026-07-11 20:17:17');

/*Table structure for table `category_sequence` */

DROP TABLE IF EXISTS `category_sequence`;

CREATE TABLE `category_sequence` (
  `category_code` varchar(10) NOT NULL,
  `last_sequence` int(11) DEFAULT 0,
  PRIMARY KEY (`category_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `category_sequence` */

insert  into `category_sequence`(`category_code`,`last_sequence`) values 
('111',1),
('112',0),
('121',0),
('122',0),
('123',0),
('131',0),
('132',0),
('141',0),
('142',0),
('151',0),
('152',0),
('161',0),
('162',0),
('211',0),
('212',0),
('213',0),
('221',0),
('222',0),
('223',0),
('231',0),
('232',0),
('241',0),
('242',0),
('311',0),
('312',0),
('313',0),
('321',0),
('322',0),
('323',0),
('331',0),
('332',0),
('333',0),
('411',0),
('412',0),
('413',0),
('421',0),
('422',0),
('423',0),
('431',0),
('432',0),
('433',0),
('511',0),
('512',0),
('513',0),
('521',0),
('522',0),
('523',0),
('531',0),
('532',0),
('533',0),
('611',0),
('612',0),
('613',0),
('621',0),
('622',0),
('623',0),
('631',0),
('632',0),
('633',0),
('711',0),
('712',0),
('713',0),
('721',0),
('722',0),
('723',0),
('731',0),
('732',0),
('733',0),
('811',0),
('812',0),
('813',0),
('821',0),
('822',0),
('823',0),
('831',0),
('832',0),
('833',0);

/*Table structure for table `customer_contact` */

DROP TABLE IF EXISTS `customer_contact`;

CREATE TABLE `customer_contact` (
  `user_id` varchar(50) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `customer_contact` */

insert  into `customer_contact`(`user_id`,`customer_name`,`email`,`mobile_number`,`created_date`) values 
('USER-1001','Arkaprava','chakrabartiarkaprava@gmail.com','7003955378','2026-06-14 14:02:06'),
('USER-1002','Raj Das','rajdas31800@gmail.com','9330248654','2026-06-14 14:02:06');

/*Table structure for table `fraud_logs` */

DROP TABLE IF EXISTS `fraud_logs`;

CREATE TABLE `fraud_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `payment_id` varchar(50) DEFAULT NULL,
  `risk_score` decimal(5,2) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `fraud_logs` */

/*Table structure for table `order_items` */

DROP TABLE IF EXISTS `order_items`;

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `item_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_item_order` (`order_id`),
  KEY `fk_order_item_product` (`product_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `order_items` */

insert  into `order_items`(`id`,`order_id`,`product_id`,`quantity`,`item_price`,`total_price`) values 
(1,'ORD-0db7fb1f','PROD-fdb8f87d',1,5000.00,5000.00),
(2,'ORD-d359dfc9','PROD-fdb8f87d',3,15000.00,15000.00),
(3,'ORD-c1466531','PROD-56637849',2,40000.00,40000.00),
(4,'ORD-a4b6b9a9','PROD-fdb8f87d',2,10000.00,10000.00),
(5,'ORD-46d07acb','PROD-fdb8f87d',2,10000.00,10000.00),
(6,'ORD-1ad3e210','PROD-fdb8f87d',2,10000.00,10000.00);

/*Table structure for table `order_req_res` */

DROP TABLE IF EXISTS `order_req_res`;

CREATE TABLE `order_req_res` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) DEFAULT NULL,
  `request_payload` longtext DEFAULT NULL,
  `response_payload` longtext DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `order_req_res` */

/*Table structure for table `orders` */

DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `order_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `idempotency_key` varchar(100) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `orders` */

insert  into `orders`(`order_id`,`user_id`,`total_amount`,`status`,`payment_id`,`idempotency_key`,`created_date`,`updated_date`,`razorpay_order_id`) values 
('ORD-0db7fb1f','USER-1001',5000.00,'CONFIRMED','P-143211b9','IDEMP-2fdc4a54-2','2026-06-14 23:06:32','2026-06-14 23:06:32',NULL),
('ORD-1ad3e210','USER-1001',10000.00,'CONFIRMED','P-f7824389','IDEMP-e1bb1c89-a','2026-06-20 20:25:16','2026-06-20 20:25:16',NULL),
('ORD-46d07acb','USER-1001',10000.00,'CONFIRMED','P-0596de8c','IDEMP-0028a86f-1','2026-06-15 00:20:03','2026-06-15 00:20:03',NULL),
('ORD-a4b6b9a9','USER-1001',10000.00,'CONFIRMED','P-26eac28e','IDEMP-573ac520-7','2026-06-15 00:07:02','2026-06-15 00:07:02',NULL),
('ORD-c1466531','USER-1002',40000.00,'CONFIRMED','P-f979a4c8','IDEMP-08f69fd8-3','2026-06-14 23:37:06','2026-06-14 23:37:06',NULL),
('ORD-d359dfc9','USER-1001',15000.00,'CONFIRMED','P-7558ad19','IDEMP-2b7517e1-9','2026-06-14 23:16:21','2026-06-14 23:16:21',NULL);

/*Table structure for table `payment_req_res` */

DROP TABLE IF EXISTS `payment_req_res`;

CREATE TABLE `payment_req_res` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `payment_id` varchar(50) DEFAULT NULL,
  `request_payload` longtext DEFAULT NULL,
  `response_payload` longtext DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `payment_req_res` */

/*Table structure for table `payments` */

DROP TABLE IF EXISTS `payments`;

CREATE TABLE `payments` (
  `payment_id` varchar(50) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL,
  `idempotency_key` varchar(100) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `razorpay_order_id` varchar(500) DEFAULT NULL,
  `razorpay_payment_id` varchar(500) DEFAULT NULL,
  `razorpay_signature` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `payments` */

insert  into `payments`(`payment_id`,`order_id`,`user_id`,`amount`,`status`,`idempotency_key`,`created_date`,`updated_date`,`razorpay_order_id`,`razorpay_payment_id`,`razorpay_signature`) values 
('P-0596de8c','order_T1cFmkoTb54VSh','USER-1001',10000.00,'SUCCESS','IDEMP-1781463003731','2026-06-15 00:20:03','2026-06-15 00:20:03','order_T1cFmkoTb54VSh','pay_T1cG7VUcPfz8Ne','5a5ba4019c4708dd649f656418723d47f570a15babe2e36201c570174b9a8469'),
('P-143211b9','order_T1ayvwS2bZPNzi','USER-1001',5000.00,'SUCCESS','IDEMP-1781458592476','2026-06-14 23:06:32','2026-06-14 23:06:32','order_T1ayvwS2bZPNzi','pay_T1azf8IeDE7KcT','d2266b99519c67e322aa4ac32d7ab3bf27c59d8316dd4f7634b52c037eca7398'),
('P-26eac28e','order_T1c0p9bggl9tlh','USER-1001',10000.00,'SUCCESS','IDEMP-1781462222197','2026-06-15 00:07:02','2026-06-15 00:07:02','order_T1c0p9bggl9tlh','pay_T1c2Kz8LdJr3Mo','e3a9e1522ef32fe85bed57e9a3672f78698adc484025c091b682490e219df83f'),
('P-7558ad19','order_T1bAKT7vE3CTHc','USER-1001',15000.00,'SUCCESS','IDEMP-1781459181721','2026-06-14 23:16:21','2026-06-14 23:16:21','order_T1bAKT7vE3CTHc','pay_T1bAfCetyDZNZW','4d46cfa3c06ac0bd4ca1f1a259e1939bae218a4f98fe5abfdb5ae8431550deb4'),
('P-f7824389','order_T3vS9rYMJ6hvXU','USER-1001',10000.00,'SUCCESS','IDEMP-1781967316447','2026-06-20 20:25:16','2026-06-20 20:25:16','order_T3vS9rYMJ6hvXU','pay_T3vSaex3xSWYPf','bfbb40cb465006b252dac9186e7536b81adf6a8526b91ed85be38cb59c36ed9f'),
('P-f979a4c8','order_T1bWI89EOaC7Zl','USER-1002',40000.00,'SUCCESS','IDEMP-1781460426421','2026-06-14 23:37:06','2026-06-14 23:37:06','order_T1bWI89EOaC7Zl','pay_T1bWhTIb9iujeg','e0a06fcaa89a6409ff57842d11042144ad9427fc130a56872badc38ed38f0aeb');

/*Table structure for table `products` */

DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `category_code` varchar(20) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category_path` varchar(50) DEFAULT NULL,
  `category_name_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `products` */

insert  into `products`(`product_id`,`product_name`,`category_code`,`price`,`stock`,`status`,`created_date`,`updated_date`,`category_path`,`category_name_path`) values 
('PRD111000001','MOTOROLA EDGE 70 FUSION','111',25000.00,10,'ACTIVE','2026-07-11 20:25:23','2026-07-11 20:25:23','1>11>111','Electronics > Mobile Phones > Smartphones'),
('PROD-56637849','IQOO Z9','Mobile',20000.00,18,'ACTIVE','2026-06-14 23:17:48','2026-06-14 23:37:06',NULL,NULL),
('PROD-7972725e','Samsung S25','Mobile',65000.00,19,'ACTIVE','2026-05-24 11:30:06','2026-06-14 23:24:02',NULL,NULL),
('PROD-fdb8f87d','iPhone 16','Mobile',5000.00,44,'ACTIVE','2026-05-23 11:09:33','2026-06-20 20:25:16',NULL,NULL);

/*Table structure for table `transactions` */

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `txn_id` varchar(50) NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `wallet_id` varchar(50) DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`txn_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `transactions` */

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `created_at` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `users` */

/*Table structure for table `wallets` */

DROP TABLE IF EXISTS `wallets`;

CREATE TABLE `wallets` (
  `wallet_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`wallet_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `wallets` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
