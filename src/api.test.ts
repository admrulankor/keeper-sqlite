import { expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createNoteStore } from "./database";
import { createRoutes } from "./index";

test("notes and deletions persist after reopening SQLite through the API", async () => {
  const directory = mkdtempSync(join(tmpdir(), "keeper-test-"));
  const filename = join(directory, "notes.sqlite");
  let store = createNoteStore(filename);
  let server = Bun.serve({ port: 0, routes: createRoutes(store) });
  const request = (path: string, init?: RequestInit) => fetch(new URL(path, server.url), init);
  const post = (body: unknown) => request("/api/notes", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  try {
    const page = await request("/");
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('id="root"');
    expect(await (await request("/api/notes")).json()).toEqual([]);
    const result = await post({ title: "  Reminder  ", content: "It's safe: '); DROP TABLE notes; --\nSecond line" });
    expect(result.status).toBe(201);
    const note = await result.json();
    expect(note.title).toBe("Reminder");
    await server.stop(true);
    store.close();
    store = createNoteStore(filename);
    server = Bun.serve({ port: 0, routes: createRoutes(store) });
    expect(await (await request("/api/notes")).json()).toEqual([note]);
    expect((await request(`/api/notes/${note.id}`, { method: "DELETE" })).status).toBe(204);
    expect((await request(`/api/notes/${note.id}`, { method: "DELETE" })).status).toBe(404);
    await server.stop(true);
    store.close();
    store = createNoteStore(filename);
    server = Bun.serve({ port: 0, routes: createRoutes(store) });
    expect(await (await request("/api/notes")).json()).toEqual([]);
    const next = await (await post({ title: "", content: "Content only" })).json();
    expect(next.id).toBeGreaterThan(note.id);
  } finally {
    await server.stop(true);
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("API rejects invalid input without changing stored notes", async () => {
  const store = createNoteStore(":memory:");
  const server = Bun.serve({ port: 0, routes: createRoutes(store) });
  try {
    for (const body of ["{", "null", "[]", '{"title":3,"content":"hi"}', '{"title":" ","content":"\\n"}']) {
      const response = await fetch(new URL("/api/notes", server.url), { method: "POST", body });
      expect(response.status).toBe(400);
    }
    for (const id of ["0", "-1", "abc", "1.5", "9007199254740992"]) {
      expect((await fetch(new URL(`/api/notes/${id}`, server.url), { method: "DELETE" })).status).toBe(400);
    }
    expect((await fetch(new URL("/api/missing", server.url))).status).toBe(404);
    expect(store.list()).toEqual([]);
  } finally {
    await server.stop(true);
    store.close();
  }
});
