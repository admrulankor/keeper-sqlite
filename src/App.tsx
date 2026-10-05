// @ts-ignore: CSS import is handled by the bundler.
import "./index.css";

import { useEffect, useState } from "react";
import type { NoteInput, StoredNote } from "./types";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Note from "./components/Note";
import CreateArea from "./components/CreateArea";

export function App() {
  const [noteList, setNoteList] = useState<StoredNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number[]>([]);

  async function loadNotes() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Unable to load notes. Please retry.");
      setNoteList(await response.json());
      setLoadFailed(false);
    } catch {
      setError("Unable to load notes. Please retry.");
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadNotes(); }, []);

  async function addNote(note: NoteInput) {
    setError("");
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      if (!response.ok) throw new Error("Unable to save note.");
      const savedNote: StoredNote = await response.json();
      setNoteList((previousNotes) => [...previousNotes, savedNote]);
      return true;
    } catch {
      setError("Unable to save note. Your draft has been kept; please retry.");
      return false;
    }
  }

  async function deleteNote(id: number) {
    setError("");
    setDeleting((previous) => [...previous, id]);
    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) throw new Error("Unable to delete note.");
      setNoteList((previousNotes) => previousNotes.filter((note) => note.id !== id));
    } catch {
      setError("Unable to delete note. Please retry.");
    } finally {
      setDeleting((previous) => previous.filter((noteId) => noteId !== id));
    }
  }

  return (
    <main className="bg-gray-200 min-h-screen">
      <Header />
      <CreateArea onAdd={addNote} disabled={loading || loadFailed} />
      {loading && <p role="status" className="text-center p-2">Loading notes...</p>}
      {error && <p role="alert" className="text-center text-red-700 p-2">{error}</p>}
      {loadFailed && !loading && (
        <button onClick={() => void loadNotes()} className="block mx-auto bg-yellow-300 rounded-md px-4 py-2">
          Retry loading notes
        </button>
      )}
      <section className="flex flex-wrap justify-start items-start">
        {noteList.map((noteEntry) =>
          <Note
            key={noteEntry.id}
            title={noteEntry.title}
            content={noteEntry.content}
            deleting={deleting.includes(noteEntry.id)}
            onDelete={() => void deleteNote(noteEntry.id)} />
        )}
      </section>
      <Footer />
    </main>
  );
}

export default App;
