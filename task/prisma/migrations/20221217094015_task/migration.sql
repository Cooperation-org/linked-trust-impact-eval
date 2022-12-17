-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task" TEXT NOT NULL,
    "by" TEXT NOT NULL,
    "credit" INTEGER NOT NULL,
    "round" TEXT NOT NULL
);
