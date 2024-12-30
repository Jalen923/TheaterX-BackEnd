-- CreateTable
CREATE TABLE `Event` (
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
