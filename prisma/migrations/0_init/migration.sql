-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DbConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "allowDiskUse" BOOLEAN NOT NULL DEFAULT true,
    "connectionString" TEXT NOT NULL,
    "tls" BOOLEAN NOT NULL DEFAULT false,
    "tlsAllowInvalidCertificates" BOOLEAN NOT NULL DEFAULT true,
    "tlsCAFile" TEXT NOT NULL,
    "tlsCertificateKeyFile" TEXT NOT NULL,
    "tlsCertificateKeyFilePassword" TEXT NOT NULL,
    "maxPoolSize" INTEGER NOT NULL DEFAULT 4,
    "whitelist" TEXT NOT NULL,
    "blacklist" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DbConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

