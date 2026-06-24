/*
  Warnings:

  - The values [CLOSED] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `activityType` on the `TicketActivity` table. All the data in the column will be lost.
  - Added the required column `activity` to the `TicketActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED');
ALTER TABLE "public"."Ticket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Ticket" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "Ticket" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterTable
ALTER TABLE "TicketActivity" DROP COLUMN "activityType",
ADD COLUMN     "activity" TEXT NOT NULL;
