import { serve } from "bun";
import index from "./index.html";
import { createNoteStore, type NoteStore } from "./database";

export function createRoutes(store: NoteStore) {
  return {
    "/*": index,
    "/api/notes": {
      GET: () => Response.json(store.list(), {
        headers: { "Cache-Control": "no-store" },
      }),
      POST: async (request: Request) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }
        if (
          !body || typeof body !== "object" ||
          !("title" in body) || typeof body.title !== "string" ||
          !("content" in body) || typeof body.content !== "string"
        ) {
          return Response.json({ error: "Title and content must be strings." }, { status: 400 });
        }
        const note = { title: body.title.trim(), content: body.content.trim() };
        if (!note.title && !note.content) {
          return Response.json({ error: "A note cannot be empty." }, { status: 400 });
        }
        return Response.json(store.add(note), { status: 201 });
      },
    },
    "/api/notes/:id": {
      DELETE: (request: Request & { params: { id: string } }) => {
        const id = Number(request.params.id);
        if (!/^\d+$/.test(request.params.id) || !Number.isSafeInteger(id) || id < 1) {
          return Response.json({ error: "Invalid note ID." }, { status: 400 });
        }
        if (!store.delete(id)) {
          return Response.json({ error: "Note not found." }, { status: 404 });
        }
        return new Response(null, { status: 204 });
      },
    },
    "/api/*": () => Response.json({ error: "API route not found." }, { status: 404 }),
  };
}

if (import.meta.main) {
  const store = createNoteStore();

  const server = serve({
    routes: createRoutes(store),

    error(error) {
      console.error(error);
      return Response.json({ error: "Unable to complete the request." }, { status: 500 });
    },

    development: process.env.NODE_ENV !== "production" && {
      // Enable browser hot reloading in development
      hmr: true,

      // Echo console logs from the browser to the server
      console: true,
    },
  });

  console.log(`🚀 Server running at ${server.url}`);
}
