import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NoteInput, StoredNote } from "./types";

export function createNoteStore(
  filename = process.env.KEEPER_DB_PATH ??
    fileURLToPath(new URL("../data/keeper.sqlite", import.meta.url)),
) {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
  const db = new Database(filename, { create: true });
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA busy_timeout = 5000");
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    CHECK (length(trim(title)) > 0 OR length(trim(content)) > 0)
  )`);

  const list = db.query<StoredNote, []>(
    "SELECT id, title, content FROM notes ORDER BY id ASC",
  );
  const insert = db.query<StoredNote, [string, string]>(
    "INSERT INTO notes (title, content) VALUES (?, ?) RETURNING id, title, content",
  );
  const remove = db.query("DELETE FROM notes WHERE id = ?");

  return {
    list: () => list.all(),
    add: (note: NoteInput) => insert.get(note.title, note.content)!,
    delete: (id: number) => remove.run(id).changes > 0,
    close: () => db.close(),
  };
}

export type NoteStore = ReturnType<typeof createNoteStore>;
