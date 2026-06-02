"use server";

import { prisma } from "@/lib/prisma";

export async function getEmpresa() {
  return await prisma.empresa.findFirst();
}