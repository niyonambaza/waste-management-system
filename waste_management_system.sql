-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 16, 2026 at 06:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `waste_management_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `collection_schedules`
--

CREATE TABLE `collection_schedules` (
  `schedule_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `collector_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `collection_date` date NOT NULL,
  `collection_time` time NOT NULL,
  `area` varchar(100) DEFAULT NULL,
  `status` enum('scheduled','ongoing','completed') DEFAULT 'scheduled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `collectors`
--

CREATE TABLE `collectors` (
  `collector_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_number` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('read','unread') DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `target_role` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `status`, `created_at`, `target_role`, `is_read`) VALUES
(3, NULL, 'asdfghjkllkjhgf', 'dfghm,mfdsfgnm,', '', '2026-06-12 14:00:10', 'all', 0),
(4, NULL, 'scaschasaslhcg', 'x xn xcsjhsjcsc', '', '2026-06-12 14:01:32', 'all', 0),
(5, NULL, 'dxfcvm,n.mn', 'dxfj./m,hfgsd', '', '2026-06-12 14:03:07', 'resident', 0),
(6, NULL, 'scsdc sd xd sd.', 'sc ascnmsdnc', '', '2026-06-12 14:04:44', 'staff', 0);

-- --------------------------------------------------------

--
-- Table structure for table `recycled_materials`
--

CREATE TABLE `recycled_materials` (
  `material_id` int(11) NOT NULL,
  `center_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `material_type` varchar(100) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `date_received` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recycling_centers`
--

CREATE TABLE `recycling_centers` (
  `center_id` int(11) NOT NULL,
  `center_name` varchar(100) NOT NULL,
  `location` text NOT NULL,
  `contact_phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recycling_centers`
--

INSERT INTO `recycling_centers` (`center_id`, `center_name`, `location`, `contact_phone`) VALUES
(1, 'kats', 'kirehe', '0797567545');

-- --------------------------------------------------------

--
-- Table structure for table `recycling_staff`
--

CREATE TABLE `recycling_staff` (
  `staff_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `center_id` int(11) NOT NULL,
  `employee_number` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `resident_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `residents`
--

INSERT INTO `residents` (`resident_id`, `user_id`, `address`) VALUES
(1, 12, 'huye');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','resident','collector','recycling_staff') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `fullname`, `email`, `phone`, `password`, `role`, `created_at`) VALUES
(1, 'John Doe', 'johndoe@example.com', '+250788123456', '$2b$10$sjLhHzhwbH8BFIk5aizY8ua/s6RQGc1AAJ.qyNntnK73aAugpFUj6', 'resident', '2026-06-10 13:26:03'),
(3, 'ful', 'foibe@gmail.com', '0794564364', '$2b$10$Dc6QXXMrIasUwlIoum2IBOx4OSYI26skQKYKnbdFrZ5WcXzpKk2VW', 'collector', '2026-06-10 15:02:00'),
(6, 'niyonambaza ', 'fulgence22@gmail.com', '0794564363', '$2b$10$PAxd4R.O2nJprvu060XmtebekEITnXGeGle3mMZzdYlykqP8mYD2u', 'admin', '2026-06-10 16:31:23'),
(8, 'genzo codes', 'ful@gmail.com', '0794564367', '$2b$10$PmI20pYgksm54vklQBSSietrTPRPIGvr6hz7eEmLGsGE/Ugu8PleK', 'admin', '2026-06-10 18:42:37'),
(12, 'samu', 'sum@gmail.com', '07968765334', '$2b$10$8uf/bvaQasPPTMhFh/Z2N.TxKliDBxgLLajXCtk05HJnEjLNfV.kS', 'resident', '2026-06-12 12:33:52'),
(14, 'bahati', 'bahat@gmail.com', '089765435435', '$2b$10$z9yxQsnlJmAh3XJcoEsUu.0ivqdkksHTg1Vou/mpZM7YRw8.kQx22', 'collector', '2026-06-12 14:13:21');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `plate_number` varchar(20) NOT NULL,
  `vehicle_type` varchar(50) NOT NULL,
  `capacity` decimal(10,2) DEFAULT NULL,
  `status` enum('available','assigned','maintenance') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `plate_number`, `vehicle_type`, `capacity`, `status`) VALUES
(1, 'REA123S', 'truck', 1000.00, 'available');

-- --------------------------------------------------------

--
-- Table structure for table `waste_requests`
--

CREATE TABLE `waste_requests` (
  `request_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `waste_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `location` text DEFAULT NULL,
  `request_date` datetime DEFAULT current_timestamp(),
  `status` enum('pending','assigned','in_progress','completed','cancelled') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waste_requests`
--

INSERT INTO `waste_requests` (`request_id`, `resident_id`, `waste_type`, `description`, `image`, `location`, `request_date`, `status`) VALUES
(6, 1, 'organic', 'ghjkllkjgfdfjkl', 'waste.png', 'huye', '2026-06-12 15:18:00', ''),
(7, 1, 'organic', 'pooor service ', 'ChatGPT Image Apr 27, 2026, 05_57_18 AM.png', 'nyagatare', '2026-06-12 16:11:54', 'pending');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `collection_schedules`
--
ALTER TABLE `collection_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `collector_id` (`collector_id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indexes for table `collectors`
--
ALTER TABLE `collectors`
  ADD PRIMARY KEY (`collector_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `employee_number` (`employee_number`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `recycled_materials`
--
ALTER TABLE `recycled_materials`
  ADD PRIMARY KEY (`material_id`),
  ADD KEY `center_id` (`center_id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `recycling_centers`
--
ALTER TABLE `recycling_centers`
  ADD PRIMARY KEY (`center_id`);

--
-- Indexes for table `recycling_staff`
--
ALTER TABLE `recycling_staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `employee_number` (`employee_number`),
  ADD KEY `center_id` (`center_id`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`resident_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `plate_number` (`plate_number`);

--
-- Indexes for table `waste_requests`
--
ALTER TABLE `waste_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `resident_id` (`resident_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `collection_schedules`
--
ALTER TABLE `collection_schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `collectors`
--
ALTER TABLE `collectors`
  MODIFY `collector_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `recycled_materials`
--
ALTER TABLE `recycled_materials`
  MODIFY `material_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recycling_centers`
--
ALTER TABLE `recycling_centers`
  MODIFY `center_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `recycling_staff`
--
ALTER TABLE `recycling_staff`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `resident_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `waste_requests`
--
ALTER TABLE `waste_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `collection_schedules`
--
ALTER TABLE `collection_schedules`
  ADD CONSTRAINT `collection_schedules_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `waste_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `collection_schedules_ibfk_2` FOREIGN KEY (`collector_id`) REFERENCES `collectors` (`collector_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `collection_schedules_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `collectors`
--
ALTER TABLE `collectors`
  ADD CONSTRAINT `collectors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recycled_materials`
--
ALTER TABLE `recycled_materials`
  ADD CONSTRAINT `recycled_materials_ibfk_1` FOREIGN KEY (`center_id`) REFERENCES `recycling_centers` (`center_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `recycled_materials_ibfk_2` FOREIGN KEY (`request_id`) REFERENCES `waste_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recycling_staff`
--
ALTER TABLE `recycling_staff`
  ADD CONSTRAINT `recycling_staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `recycling_staff_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `recycling_centers` (`center_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `residents`
--
ALTER TABLE `residents`
  ADD CONSTRAINT `residents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `waste_requests`
--
ALTER TABLE `waste_requests`
  ADD CONSTRAINT `waste_requests_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
