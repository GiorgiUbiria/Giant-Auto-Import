import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export interface CustomerNoteAtom {
    id: number;
    note: string;
    isImportant: boolean;
    hasAttachments: boolean;
    createdAt: string;
    updatedAt: string;
    adminName: string;
}

// Holds notes per-customerId
export const customerNotesAtomFamily = atomFamily((customerId: string) =>
    atom<CustomerNoteAtom[]>([])
);

// Generic writer for list operations
export type CustomerNotesAction =
    | { type: 'set'; notes: CustomerNoteAtom[] }
    | { type: 'add'; note: CustomerNoteAtom }
    | { type: 'update'; note: CustomerNoteAtom }
    | { type: 'delete'; id: number }
    | { type: 'setHasAttachments'; id: number; hasAttachments: boolean };

export const customerNotesWriteAtomFamily = atomFamily((customerId: string) =>
    atom<null, CustomerNotesAction>(null, (get, set, action) => {
        const notesAtom = customerNotesAtomFamily(customerId);
        const current = get(notesAtom);
        switch (action.type) {
            case 'set':
                set(notesAtom, action.notes);
                break;
            case 'add':
                set(notesAtom, [action.note, ...current]);
                break;
            case 'update':
                set(
                    notesAtom,
                    current.map((n) => (n.id === action.note.id ? { ...n, ...action.note } : n))
                );
                break;
            case 'delete':
                set(notesAtom, current.filter((n) => n.id !== action.id));
                break;
            case 'setHasAttachments':
                set(
                    notesAtom,
                    current.map((n) => (n.id === action.id ? { ...n, hasAttachments: action.hasAttachments } : n))
                );
                break;
            default:
                break;
        }
    })
);


