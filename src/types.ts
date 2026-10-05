export interface NoteInput {
  title: string;
  content: string;
}

export interface StoredNote extends NoteInput {
  id: number;
}
