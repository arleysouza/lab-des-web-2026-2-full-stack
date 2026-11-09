import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/database";
import { students } from "@/database/schema";
import { BusinessError, hasPostgresCode } from "@/lib/business-error";
import type { Student } from "@/types/student";

export function getStudents(): Promise<Student[]> {
  return getDb().select().from(students).orderBy(asc(students.name));
}

export async function getStudent(ra: number): Promise<Student | null> {
  const [student] = await getDb().select().from(students).where(eq(students.ra, ra)).limit(1);
  return student ?? null;
}

export async function createStudent(ra: number, name: string): Promise<Student> {
  try {
    const [student] = await getDb().insert(students).values({ ra, name }).returning();
    return student;
  } catch (error) {
    if (hasPostgresCode(error, "23505")) throw new BusinessError("Já existe um estudante com este RA.");
    throw error;
  }
}

export async function updateStudent(ra: number, name: string): Promise<Student> {
  const [student] = await getDb().update(students).set({ name }).where(eq(students.ra, ra)).returning();
  if (!student) throw new BusinessError("Estudante não encontrado. Volte para a lista.");
  return student;
}

export async function deleteStudent(ra: number): Promise<void> {
  try {
    const deleted = await getDb().delete(students).where(eq(students.ra, ra)).returning({ ra: students.ra });
    if (!deleted.length) throw new BusinessError("O estudante já foi removido. Volte para a lista.");
  } catch (error) {
    // RESTRICT pode retornar 23001; versões anteriores usam 23503.
    if (hasPostgresCode(error, "23503") || hasPostgresCode(error, "23001")) {
      throw new BusinessError("Este estudante possui matrículas e não pode ser removido.");
    }
    throw error;
  }
}
