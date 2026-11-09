"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as studentsService from "@/services/students";
import { isValidRa } from "@/lib/validation";
import { BusinessError } from "@/lib/business-error";

// Os argumentos vêm do navegador: validar também em tempo de execução.
export async function createStudent(ra: string, name: string): Promise<string> {
  if (typeof ra !== "string" || !isValidRa(ra)) return "Informe um RA inteiro entre 1 e 2147483647.";
  if (typeof name !== "string") return "Informe um nome válido.";
  name = name.trim();
  if (name.length < 3 || name.length > 100) return "O nome deve ter entre 3 e 100 caracteres.";

  try {
    await studentsService.createStudent(Number(ra), name);
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    console.error("Falha ao cadastrar estudante:", error);
    return "Não foi possível confirmar o cadastro. Consulte a lista antes de tentar novamente.";
  }

  revalidatePath("/alunos", "layout");
  // redirect interrompe a função e deve ficar fora do try/catch.
  redirect(`/alunos/${Number(ra)}`);
}

export async function updateStudent(ra: number, name: string): Promise<string> {
  if (typeof ra !== "number" || !isValidRa(String(ra))) return "RA inválido.";
  if (typeof name !== "string") return "Informe um nome válido.";
  name = name.trim();
  if (name.length < 3 || name.length > 100) return "O nome deve ter entre 3 e 100 caracteres.";

  try {
    await studentsService.updateStudent(ra, name);
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    console.error("Falha ao atualizar estudante:", error);
    return "Não foi possível confirmar a atualização. Consulte os dados antes de tentar novamente.";
  }

  revalidatePath("/alunos", "layout");
  redirect(`/alunos/${ra}`);
}

export async function deleteStudent(ra: number): Promise<string> {
  if (typeof ra !== "number" || !isValidRa(String(ra))) return "RA inválido.";

  try {
    await studentsService.deleteStudent(ra);
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    console.error("Falha ao remover estudante:", error);
    return "Não foi possível confirmar a exclusão. Consulte a lista antes de tentar novamente.";
  }

  revalidatePath("/alunos", "layout");
  redirect("/alunos");
}
