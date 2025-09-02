import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { z } from 'zod';
import { selectUserSchema, selectCarSchema } from './drizzle/schema';
import { SortingState, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';

// Simplified state management for admin user page
// Only essential UI state, no data fetching state

// User data (passed as props, not fetched)
export const adminUserDataAtom = atom<z.infer<typeof selectUserSchema> | null>(null);

// User cars data (passed as props, not fetched)
export const adminUserCarsAtom = atom<z.infer<typeof selectCarSchema>[]>([]);

// UI state only
export const adminUserActiveTabAtom = atomWithStorage('admin-user-active-tab', 'overview');

// Loading state for UI operations (not data fetching)
export const adminUserUILoadingAtom = atom(false);

// Error state for UI operations
export const adminUserUIErrorAtom = atom<string | null>(null);

// Table state atoms (for cars table)
export const adminUserTableStateAtom = atom({
    pageIndex: 0,
    pageSize: 20,
    sorting: [] as SortingState,
    filters: [] as ColumnFiltersState,
    columnVisibility: {} as VisibilityState,
    rowSelection: {},
});

// Refetch trigger atom (for UI refresh)
export const adminUserRefetchTriggerAtom = atom(0);

// Tab management
export const setAdminUserActiveTabAtom = atom(
    null,
    (get, set, tab: string) => {
        set(adminUserActiveTabAtom, tab);
    }
);

// UI loading state management
export const setAdminUserUILoadingAtom = atom(
    null,
    (get, set, loading: boolean) => {
        set(adminUserUILoadingAtom, loading);
    }
);

// UI error state management
export const setAdminUserUIErrorAtom = atom(
    null,
    (get, set, error: string | null) => {
        set(adminUserUIErrorAtom, error);
    }
);

// Table state setters
export const setAdminUserTablePageAtom = atom(
    null,
    (get, set, pageIndex: number, pageSize: number) => {
        const current = get(adminUserTableStateAtom);
        set(adminUserTableStateAtom, { ...current, pageIndex, pageSize });
    }
);

export const setAdminUserTableSortingAtom = atom(
    null,
    (get, set, sorting: SortingState) => {
        const current = get(adminUserTableStateAtom);
        set(adminUserTableStateAtom, { ...current, sorting });
    }
);

export const setAdminUserTableFiltersAtom = atom(
    null,
    (get, set, filters: ColumnFiltersState) => {
        const current = get(adminUserTableStateAtom);
        set(adminUserTableStateAtom, { ...current, filters });
    }
);

export const setAdminUserTableColumnVisibilityAtom = atom(
    null,
    (get, set, columnVisibility: VisibilityState) => {
        const current = get(adminUserTableStateAtom);
        set(adminUserTableStateAtom, { ...current, columnVisibility });
    }
);

export const setAdminUserTableRowSelectionAtom = atom(
    null,
    (get, set, rowSelection: any) => {
        const current = get(adminUserTableStateAtom);
        set(adminUserTableStateAtom, { ...current, rowSelection });
    }
);

// Refetch trigger setter
export const triggerAdminUserRefetchAtom = atom(
    null,
    (get, set) => {
        const current = get(adminUserRefetchTriggerAtom);
        set(adminUserRefetchTriggerAtom, current + 1);
    }
);

// Reset UI state (not data)
export const resetAdminUserUIStateAtom = atom(
    null,
    (get, set) => {
        set(adminUserActiveTabAtom, 'overview');
        set(adminUserUILoadingAtom, false);
        set(adminUserUIErrorAtom, null);
        set(adminUserTableStateAtom, {
            pageIndex: 0,
            pageSize: 20,
            sorting: [],
            filters: [],
            columnVisibility: {},
            rowSelection: {},
        });
    }
);
