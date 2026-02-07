-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "availablePositionAndRoleType" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Position" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "positionName" TEXT NOT NULL,
    "order" INTEGER,
    "isDisplay" BOOLEAN NOT NULL DEFAULT true,
    "availableDutyType" JSONB,
    "availableRoleType" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "DutyRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "dutyType" TEXT,
    "roleType" TEXT NOT NULL,
    "inTime" DATETIME NOT NULL,
    "outTime" DATETIME,
    CONSTRAINT "DutyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DutyRecord_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Position_positionName_key" ON "Position"("positionName");
