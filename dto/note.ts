type NoteInfo = {
    id: number;
    author: string;
    title: string;
    categories: string[];
    keywords: string[];
}
type Note = NoteInfo & {
    content: string;
}

export type {Note, NoteInfo};
