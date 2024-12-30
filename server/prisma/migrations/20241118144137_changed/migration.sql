/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Event`;

-- CreateTable
CREATE TABLE `TheaterEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `bookingPhrase` VARCHAR(191) NOT NULL,
    `specialEvent` BOOLEAN NOT NULL,
    `background` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
