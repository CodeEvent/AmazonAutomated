-- AlterTable: Host — additive, nullable/defaulted columns, safe on existing rows.
ALTER TABLE "Host"
  ADD COLUMN "livesIn" TEXT,
  ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "identityVerified" BOOLEAN NOT NULL DEFAULT false;
