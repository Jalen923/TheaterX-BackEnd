/*
  Warnings:

  - You are about to alter the column `price` on the `Showtime` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `price` on the `Ticket` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Showtime` MODIFY `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Ticket` MODIFY `price` INTEGER NOT NULL;
