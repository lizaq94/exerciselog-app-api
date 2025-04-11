/*
  Warnings:

  - A unique constraint covering the columns `[exerciseId]` on the table `Upload` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `exerciseId` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Workout` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Exercise_name_key";

-- AlterTable
ALTER TABLE "Exercise" ALTER COLUMN "notes" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "exerciseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workout" ALTER COLUMN "notes" DROP NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Upload_exerciseId_key" ON "Upload"("exerciseId");

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
