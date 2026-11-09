import { integer, pgTable, primaryKey, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  ra: integer("ra").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const enrollments = pgTable("enrollments", {
  studentRa: integer("student_ra").notNull().references(() => students.ra, {
    onUpdate: "cascade", onDelete: "restrict",
  }),
  courseId: integer("course_id").notNull().references(() => courses.id, {
    onUpdate: "cascade", onDelete: "restrict",
  }),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.studentRa, table.courseId] })]);
