-- CreateTable
CREATE TABLE "p2pTransaction" (
    "id" SERIAL NOT NULL,
    "status" "OnRampStatus" NOT NULL DEFAULT 'Processing',
    "token" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "p2pTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "p2pTransaction_token_key" ON "p2pTransaction"("token");

-- AddForeignKey
ALTER TABLE "p2pTransaction" ADD CONSTRAINT "p2pTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
