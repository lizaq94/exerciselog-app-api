-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('image');

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(1024) NOT NULL,
    "path" VARCHAR(1024) NOT NULL,
    "type" "FileType" NOT NULL DEFAULT 'image',
    "mime" VARCHAR(128) NOT NULL,
    "size" INTEGER NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);
