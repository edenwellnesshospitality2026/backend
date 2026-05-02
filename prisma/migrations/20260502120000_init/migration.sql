-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `must_change_password` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listings` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `listing_type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `short_description` TEXT NOT NULL,
    `full_description` TEXT NULL,
    `max_guests` INTEGER NOT NULL,
    `base_occupancy` INTEGER NOT NULL,
    `amenities` JSON NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `gallery_images` JSON NOT NULL,
    `base_price` DOUBLE NOT NULL,
    `discount_price` DOUBLE NULL,
    `taxes_info` TEXT NULL,
    `available_inventory` INTEGER NOT NULL,
    `total_inventory` INTEGER NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `created_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `listings_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listing_rate_plans` (
    `id` VARCHAR(191) NOT NULL,
    `listing_id` VARCHAR(191) NOT NULL,
    `external_plan_id` VARCHAR(191) NOT NULL,
    `code` ENUM('EP', 'CP', 'MAP') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `meal_inclusion` VARCHAR(191) NOT NULL,
    `price_per_night` DOUBLE NOT NULL,
    `discounted_price` DOUBLE NULL,
    `availability` VARCHAR(191) NOT NULL,
    `cancellation_policy_snippet` TEXT NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `available_inventory` INTEGER NOT NULL,
    `total_inventory` INTEGER NOT NULL,

    UNIQUE INDEX `listing_rate_plans_listing_id_external_plan_id_key`(`listing_id`, `external_plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `booking_id` VARCHAR(191) NOT NULL,
    `guest_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `listing_name` VARCHAR(191) NOT NULL,
    `room_type` VARCHAR(191) NOT NULL,
    `check_in` VARCHAR(191) NULL,
    `check_out` VARCHAR(191) NULL,
    `nights` INTEGER NULL,
    `adults` INTEGER NOT NULL,
    `children` INTEGER NOT NULL,
    `infants` INTEGER NOT NULL,
    `total_guests` INTEGER NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `payment_status` ENUM('paid', 'partial', 'unpaid', 'refunded') NOT NULL,
    `booking_status` ENUM('new', 'pending', 'confirmed', 'cancelled', 'checked-in', 'checked-out') NOT NULL,
    `confirmation_call_status` VARCHAR(191) NULL,
    `assigned_staff_member` VARCHAR(191) NULL,
    `booking_source` VARCHAR(191) NOT NULL DEFAULT 'website',
    `notes` TEXT NULL,
    `internal_remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`booking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_enquiries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `booking_type` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `source_url` VARCHAR(191) NULL,
    `status` ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_enquiries` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `guests` INTEGER NOT NULL,
    `check_in` VARCHAR(191) NULL,
    `listing_slug` VARCHAR(191) NULL,
    `room_name` VARCHAR(191) NULL,
    `rate_plan_summary` TEXT NULL,
    `estimated_total` DOUBLE NULL,
    `notes` TEXT NULL,
    `source_url` VARCHAR(191) NULL,
    `status` ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership_tiers` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price_label` VARCHAR(191) NOT NULL DEFAULT 'On request',
    `features` JSON NOT NULL,
    `is_popular` BOOLEAN NOT NULL DEFAULT false,
    `primary_cta_label` VARCHAR(191) NOT NULL DEFAULT 'Talk to our team',
    `primary_cta_href` VARCHAR(191) NOT NULL DEFAULT 'tel:+917533909333',
    `secondary_cta_label` VARCHAR(191) NOT NULL DEFAULT 'Email membership',
    `secondary_cta_href` VARCHAR(191) NOT NULL DEFAULT 'mailto:reservations@edenwellnesshospitality.com',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest_stories` (
    `id` VARCHAR(191) NOT NULL,
    `headline` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `youtube_url` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `rating` INTEGER NULL,
    `side_text` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_categories` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gallery_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_images` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `secure_url` TEXT NOT NULL,
    `public_id` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NOT NULL DEFAULT '',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listing_rate_plans` ADD CONSTRAINT `listing_rate_plans_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_images` ADD CONSTRAINT `gallery_images_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `gallery_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

