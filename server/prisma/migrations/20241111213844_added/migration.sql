-- CreateTable
CREATE TABLE `Format` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Movie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `runtime` VARCHAR(191) NOT NULL,
    `rating` VARCHAR(191) NOT NULL,
    `releaseDate` VARCHAR(191) NOT NULL,
    `poster` VARCHAR(191) NOT NULL,
    `trailer` VARCHAR(191) NOT NULL,
    `nowPlaying` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Screen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `theaterId` INTEGER NOT NULL,
    `formatId` INTEGER NOT NULL,
    `number` INTEGER NOT NULL,

    INDEX `Screen_formatId_fkey`(`formatId`),
    INDEX `Screen_theaterId_fkey`(`theaterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `screenId` INTEGER NOT NULL,
    `showtimeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `available` BOOLEAN NOT NULL,
    `accessability` BOOLEAN NOT NULL,
    `ticketId` INTEGER NULL,

    INDEX `Seat_screenId_fkey`(`screenId`),
    INDEX `Seat_showtimeId_fkey`(`showtimeId`),
    INDEX `Seat_ticketId_fkey`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Showtime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `theaterId` INTEGER NOT NULL,
    `movieId` INTEGER NOT NULL,
    `time` DATETIME(3) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `screenId` INTEGER NOT NULL,

    INDEX `Showtime_movieId_fkey`(`movieId`),
    INDEX `Showtime_screenId_fkey`(`screenId`),
    INDEX `Showtime_theaterId_fkey`(`theaterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Theater` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `zipCode` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `openTime` VARCHAR(191) NOT NULL,
    `closeTime` VARCHAR(191) NOT NULL,
    `standard` BOOLEAN NOT NULL,
    `imax` BOOLEAN NOT NULL,
    `screenX` BOOLEAN NOT NULL,
    `dolby` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `showtimeId` INTEGER NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,

    INDEX `Ticket_showtimeId_fkey`(`showtimeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Screen` ADD CONSTRAINT `Screen_formatId_fkey` FOREIGN KEY (`formatId`) REFERENCES `Format`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Screen` ADD CONSTRAINT `Screen_theaterId_fkey` FOREIGN KEY (`theaterId`) REFERENCES `Theater`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_screenId_fkey` FOREIGN KEY (`screenId`) REFERENCES `Screen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_showtimeId_fkey` FOREIGN KEY (`showtimeId`) REFERENCES `Showtime`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Showtime` ADD CONSTRAINT `Showtime_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Showtime` ADD CONSTRAINT `Showtime_screenId_fkey` FOREIGN KEY (`screenId`) REFERENCES `Screen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Showtime` ADD CONSTRAINT `Showtime_theaterId_fkey` FOREIGN KEY (`theaterId`) REFERENCES `Theater`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_showtimeId_fkey` FOREIGN KEY (`showtimeId`) REFERENCES `Showtime`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
