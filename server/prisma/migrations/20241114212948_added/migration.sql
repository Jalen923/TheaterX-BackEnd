/*
  Warnings:

  - Added the required column `movieTitle` to the `HomeHeroItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HomeHeroItem` ADD COLUMN `movieTitle` VARCHAR(191) NOT NULL;
