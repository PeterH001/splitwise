/*
  Warnings:

  - Added the required column `name` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'Grocery',
ALTER COLUMN "distribution" SET DEFAULT 'equal';
