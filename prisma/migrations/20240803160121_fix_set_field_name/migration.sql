/*
  Warnings:

  - You are about to drop the column `repetition` on the `Set` table. All the data in the column will be lost.
  - Added the required column `repetitions` to the `Set` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Set" DROP COLUMN "repetition",
ADD COLUMN     "repetitions" INTEGER NOT NULL;
