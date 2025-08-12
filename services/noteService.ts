// File: Services/noteService.ts
// 简单的内存版服务，后面你把这些函数换成 Appwrite/后端 API 就行。

export type ContentBlock =
    | { type: 'text'; value: string }
    | { type: 'image'; url: string }
    | { type: 'audio'; url: string; duration: string; transcript?: string; uploading?: boolean };

export interface Note { id: string; updatedAt: string; content: ContentBlock[] }

// ✅ 可播放的远程音频（12s mp3）
const DEMO_AUDIO_URL =
    'http://localhost/v1/storage/buckets/689b2283000a1eb4930c/files/689b2294000e0c2dfbbc/view?project=688a534b000dacc7f1c8&mode=admin';

let _notes: Note[] = [
    {
        id: '1',
        updatedAt: '2025/08/11 10:24',
        content: [
            { type: 'text', value: 'If you want to make a product that can go global, it is not enough to just translate the language.' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' },
        ],
    },
    {
        id: '3',
        updatedAt: '2025/06/16 12:24',
        content: [
            { type: 'text', value: 'It is not enough to just translate the language.' },
            { type: 'audio', url: DEMO_AUDIO_URL, duration: '00:12' }, // 👈 可直接播放
        ],
    },
    {
        id: '2',
        updatedAt: '2025/06/15 09:15',
        content: [
            { type: 'text', value: 'The key is to master two principles: to maintain the core functions that are universal globally, and to make special adjustments for different regions.' },
        ],
    },
    {
        id: '4',
        updatedAt: '2025/08/11 10:24',
        content: [
            { type: 'text', value: 'If you want to make a product that can go global, it is not enough to just translate the language.' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' },
        ],
    },
    {
        id: '5',
        updatedAt: '2025/08/11 10:24',
        content: [
            { type: 'text', value: 'This note has multiple images and audio.' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/04/24/01/29/trees-9554109_1280.jpg' },
            { type: 'image', url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' },
            { type: 'audio', url: DEMO_AUDIO_URL, duration: '00:12' }, // 👈 同样可播
        ],
    },
];

// —— CRUD（模拟异步） ——
const delay = (ms = 80) => new Promise(r => setTimeout(r, ms));

export async function listNotes(): Promise<Note[]> {
    await delay(); return JSON.parse(JSON.stringify(_notes));
}
export async function getNoteById(id: string): Promise<Note | undefined> {
    await delay(); return JSON.parse(JSON.stringify(_notes.find(n => n.id === id)));
}
export async function createNote(note: Partial<Note>): Promise<Note> {
    await delay();
    const n: Note = {
        id: String(Date.now()),
        updatedAt: new Date().toISOString(),
        content: note.content ?? [{ type: 'text', value: '' }],
    };
    _notes.unshift(n);
    return JSON.parse(JSON.stringify(n));
}
export async function updateNote(id: string, patch: Partial<Note>): Promise<Note | undefined> {
    await delay();
    const idx = _notes.findIndex(n => n.id === id);
    if (idx < 0) return;
    _notes[idx] = { ..._notes[idx], ...patch, updatedAt: new Date().toISOString() };
    return JSON.parse(JSON.stringify(_notes[idx]));
}
export async function deleteNote(id: string): Promise<void> {
    await delay(); _notes = _notes.filter(n => n.id !== id);
}

// 在本地编辑器里追加/替换区块的小工具（可选）
export async function appendBlock(id: string, block: ContentBlock) {
    await delay();
    const note = _notes.find(n => n.id === id); if (!note) return;
    note.content.push(block); note.updatedAt = new Date().toISOString();
}
export async function replaceBlockAt(id: string, index: number, block: ContentBlock) {
    await delay();
    const note = _notes.find(n => n.id === id); if (!note || !note.content[index]) return;
    note.content[index] = block; note.updatedAt = new Date().toISOString();
}
