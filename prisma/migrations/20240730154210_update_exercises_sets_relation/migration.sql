-- DropForeignKey
ALTER TABLE "Set" DROP CONSTRAINT "Set_exerciseId_fkey";

-- AlterTable
ALTER TABLE "Set" ALTER COLUMN "exerciseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
