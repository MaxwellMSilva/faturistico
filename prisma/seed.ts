import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.modulo.createMany({
    data: [
      {
        nome: "NF-e",
        codigo: "NFE",
        valor: 50,
      },
      {
        nome: "MDF-e",
        codigo: "MDFE",
        valor: 50,
      },
      {
        nome: "CT-e",
        codigo: "CTE",
        valor: 50,
      },
      {
        nome: "NFS-e",
        codigo: "NFSE",
        valor: 50,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });