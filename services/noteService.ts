/**
 * @fileoverview Note Service - In-memory note management
 * 
 * This is a mock implementation for development. Replace these functions
 * with real Appwrite/backend API calls for production.
 * 
 * Features:
 * - CRUD operations for notes
 * - Content block management
 * - Optimistic updates with proper error handling
 * - Type-safe operations using centralized types
 */

import { Note, ContentBlock, CreateNoteInput, UpdateNoteInput, ApiResponse } from '@/types';
import { APP_CONFIG } from '@/config';

// Demo audio URL from Appwrite storage
const DEMO_AUDIO_URL = APP_CONFIG.DEMO_AUDIO_URL || 
    'https://api.freedomai.fun/v1/storage/buckets/689b2283000a1eb4930c/files/689b2294000e0c2dfbbc/view?project=689c404400138a4a5f2d';

// Mock data store - in production, this would be replaced by API calls
let _notes: Note[] = [
    {
        id: '1',
        updatedAt: '2025/08/11 10:24',
        content: [
            { 
                type: 'text', 
                value: 'If you want to make a product that can go global, it is not enough to just translate the language.' 
            },
            { 
                type: 'image', 
                url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' 
            },
        ],
    },
    {
        id: '3',
        updatedAt: '2025/06/16 12:24',
        content: [
            { 
                type: 'text', 
                value: 'It is not enough to just translate the language.' 
            },
            { 
                type: 'audio', 
                url: DEMO_AUDIO_URL, 
                duration: '00:12',
                transcript: 'Demo audio with transcript support'
            },
        ],
    },
    {
        id: '2',
        updatedAt: '2025/06/15 09:15',
        content: [
            { 
                type: 'text', 
                value: 'The key is to master two principles: to maintain the core functions that are universal globally, and to make special adjustments for different regions.' 
            },
        ],
    },
    {
        id: '4',
        updatedAt: '2025/08/11 10:24',
        content: [
            { 
                type: 'text', 
                value: 'If you want to make a product that can go global, it is not enough to just translate the language.' 
            },
            { 
                type: 'image', 
                url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' 
            },
        ],
    },
    {
        id: '5',
        updatedAt: '2025/08/11 10:24',
        content: [
            { 
                type: 'text', 
                value: 'This note has multiple images and audio.' 
            },
            { 
                type: 'image', 
                url: 'https://cdn.pixabay.com/photo/2025/04/24/01/29/trees-9554109_1280.jpg' 
            },
            { 
                type: 'image', 
                url: 'https://cdn.pixabay.com/photo/2025/07/31/20/00/woman-9747618_1280.jpg' 
            },
            { 
                type: 'audio', 
                url: DEMO_AUDIO_URL, 
                duration: '00:12',
                transcript: 'Multiple content types in one note'
            },
        ],
    },
];

// ===== UTILITY FUNCTIONS =====

/**
 * Simulate network delay for realistic testing
 */
const delay = (ms: number = 80): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Deep clone objects to prevent reference issues
 */
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Generate timestamp in consistent format
 */
const generateTimestamp = (): string => {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// ===== CRUD OPERATIONS =====

/**
 * List all notes with optional sorting
 */
export async function listNotes(): Promise<ApiResponse<Note[]>> {
    try {
        await delay();
        const sortedNotes = [..._notes].sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        return {
            success: true,
            data: deepClone(sortedNotes),
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch notes',
        };
    }
}

/**
 * Get a specific note by ID
 */
export async function getNoteById(id: string): Promise<ApiResponse<Note | null>> {
    try {
        await delay();
        const note = _notes.find(n => n.id === id);
        return {
            success: true,
            data: note ? deepClone(note) : null,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch note',
        };
    }
}

/**
 * Create a new note
 */
export async function createNote(input: CreateNoteInput): Promise<ApiResponse<Note>> {
    try {
        await delay();
        const newNote: Note = {
            id: String(Date.now()),
            updatedAt: generateTimestamp(),
            content: input.content ?? [{ type: 'text', value: '' }],
        };
        _notes.unshift(newNote);
        return {
            success: true,
            data: deepClone(newNote),
            message: 'Note created successfully',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create note',
        };
    }
}

/**
 * Update an existing note
 */
export async function updateNote(id: string, patch: UpdateNoteInput): Promise<ApiResponse<Note | null>> {
    try {
        await delay();
        const idx = _notes.findIndex(n => n.id === id);
        if (idx < 0) {
            return {
                success: false,
                error: 'Note not found',
                data: null,
            };
        }
        
        _notes[idx] = {
            ..._notes[idx],
            ...patch,
            updatedAt: generateTimestamp(),
        };
        
        return {
            success: true,
            data: deepClone(_notes[idx]),
            message: 'Note updated successfully',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update note',
        };
    }
}

/**
 * Delete a note by ID
 */
export async function deleteNote(id: string): Promise<ApiResponse<void>> {
    try {
        await delay();
        const initialLength = _notes.length;
        _notes = _notes.filter(n => n.id !== id);
        
        if (_notes.length === initialLength) {
            return {
                success: false,
                error: 'Note not found',
            };
        }
        
        return {
            success: true,
            message: 'Note deleted successfully',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete note',
        };
    }
}

// ===== CONTENT BLOCK OPERATIONS =====

/**
 * Append a content block to a note
 */
export async function appendBlock(id: string, block: ContentBlock): Promise<ApiResponse<Note | null>> {
    try {
        await delay();
        const note = _notes.find(n => n.id === id);
        if (!note) {
            return {
                success: false,
                error: 'Note not found',
                data: null,
            };
        }
        
        note.content.push(block);
        note.updatedAt = generateTimestamp();
        
        return {
            success: true,
            data: deepClone(note),
            message: 'Content block added successfully',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to append block',
        };
    }
}

/**
 * Replace a content block at a specific index
 */
export async function replaceBlockAt(
    id: string, 
    index: number, 
    block: ContentBlock
): Promise<ApiResponse<Note | null>> {
    try {
        await delay();
        const note = _notes.find(n => n.id === id);
        if (!note) {
            return {
                success: false,
                error: 'Note not found',
                data: null,
            };
        }
        
        if (index < 0 || index >= note.content.length) {
            return {
                success: false,
                error: 'Invalid block index',
                data: null,
            };
        }
        
        note.content[index] = block;
        note.updatedAt = generateTimestamp();
        
        return {
            success: true,
            data: deepClone(note),
            message: 'Content block updated successfully',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to replace block',
        };
    }
}

/**
 * Remove a content block at a specific index
 */
export async function removeBlockAt(id: string, index: number): Promise<ApiResponse<Note | null>> {
    try {
        await delay();
        const note = _notes.find(n => n.id === id);
        if (!note) {
            return {
                success: false,
                error: 'Note not found',
                data: null,
            };
        }
        
        if (index < 0 || index >= note.content.length) {
            return {
                success: false,
                error: 'Invalid block index',
                data: null,
            };
        }
        
        note.content.splice(index, 1);
        note.updatedAt = generateTimestamp();
        
        return {
            success: true,
            data: deepClone(note),
            message: 'Content block removed successfully',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove block',
        };
    }
}

// ===== SEARCH AND FILTERING =====

/**
 * Search notes by text content
 */
export async function searchNotes(query: string): Promise<ApiResponse<Note[]>> {
    try {
        await delay(120); // Slightly longer delay for search
        const lowercaseQuery = query.toLowerCase().trim();
        
        if (!lowercaseQuery) {
            return await listNotes();
        }
        
        const filteredNotes = _notes.filter(note => {
            return note.content.some(block => 
                block.type === 'text' && 
                block.value.toLowerCase().includes(lowercaseQuery)
            );
        }).sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        
        return {
            success: true,
            data: deepClone(filteredNotes),
            message: `Found ${filteredNotes.length} notes matching "${query}"`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Search failed',
        };
    }
}

// ===== UTILITY EXPORTS =====

/**
 * Get notes statistics
 */
export async function getNotesStats(): Promise<ApiResponse<{
    totalNotes: number;
    totalTextBlocks: number;
    totalImageBlocks: number;
    totalAudioBlocks: number;
}>> {
    try {
        await delay(50);
        const stats = _notes.reduce(
            (acc, note) => {
                acc.totalNotes++;
                note.content.forEach(block => {
                    switch (block.type) {
                        case 'text':
                            acc.totalTextBlocks++;
                            break;
                        case 'image':
                            acc.totalImageBlocks++;
                            break;
                        case 'audio':
                            acc.totalAudioBlocks++;
                            break;
                    }
                });
                return acc;
            },
            {
                totalNotes: 0,
                totalTextBlocks: 0,
                totalImageBlocks: 0,
                totalAudioBlocks: 0,
            }
        );
        
        return {
            success: true,
            data: stats,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get statistics',
        };
    }
}
