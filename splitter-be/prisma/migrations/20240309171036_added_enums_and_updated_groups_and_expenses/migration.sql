/*
  Warnings:

  - You are about to drop the column `currency` on the `debts` table. All the data in the column will be lost.
  - Added the required column `currency2` to the `debts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distribution` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('Grocery', 'Restaurant', 'Ticket', 'Travel');

-- CreateEnum
CREATE TYPE "Distribution" AS ENUM ('equal', 'proportional', 'exact_amounts');

-- AlterTable
ALTER TABLE "debts" DROP COLUMN "currency",
ADD COLUMN     "currency2" "Currency" NOT NULL;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "category" "ExpenseCategory" NOT NULL,
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'HUF',
ADD COLUMN     "distribution" "Distribution" NOT NULL,
ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
