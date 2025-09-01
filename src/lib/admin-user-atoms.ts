import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { z } from 'zod';
import { selectUserSchema } from './drizzle/schema';
import { SortingState, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';

// User data atom
export const adminUserDataAtom = atom<z.infer<typeof selectUserSchema> | null>(null);

// User cars data atom
export const adminUserCarsAtom = atom<any[]>([]);

// Loading states
export const adminUserLoadingAtom = atom(true);
export const adminUserCarsLoadingAtom = atom(false);
export const adminUserErrorAtom = atom<string | null>(null);

// Tab management
export const adminUserActiveTabAtom = atomWithStorage('admin-user-active-tab', 'overview');

// Table state atoms
export const adminUserTableStateAtom = atom({
  pageIndex: 0,
  pageSize: 20,
  sorting: [] as SortingState,
  filters: [] as ColumnFiltersState,
  columnVisibility: {} as VisibilityState,
  rowSelection: {},
});

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

// Tab change atom
export const setAdminUserActiveTabAtom = atom(
  null,
  (get, set, tab: string) => {
    set(adminUserActiveTabAtom, tab);
  }
);

// User data setters
export const setAdminUserDataAtom = atom(
  null,
  (get, set, user: z.infer<typeof selectUserSchema>) => {
    set(adminUserDataAtom, user);
    set(adminUserLoadingAtom, false);
    set(adminUserErrorAtom, null);
  }
);

export const setAdminUserCarsAtom = atom(
  null,
  (get, set, cars: any[]) => {
    set(adminUserCarsAtom, cars);
    set(adminUserCarsLoadingAtom, false);
  }
);

// Error setters
export const setAdminUserErrorAtom = atom(
  null,
  (get, set, error: string) => {
    set(adminUserErrorAtom, error);
    set(adminUserLoadingAtom, false);
  }
);

// Loading state setters
export const setAdminUserLoadingAtom = atom(
  null,
  (get, set, loading: boolean) => {
    set(adminUserLoadingAtom, loading);
  }
);

export const setAdminUserCarsLoadingAtom = atom(
  null,
  (get, set, loading: boolean) => {
    set(adminUserCarsLoadingAtom, loading);
  }
);

// Refetch trigger atom
export const adminUserRefetchTriggerAtom = atom(0);

// Refetch trigger setter
export const triggerAdminUserRefetchAtom = atom(
  null,
  (get, set) => {
    const current = get(adminUserRefetchTriggerAtom);
    set(adminUserRefetchTriggerAtom, current + 1);
  }
);

// Reset all state atom
export const resetAdminUserStateAtom = atom(
  null,
  (get, set) => {
    set(adminUserDataAtom, null);
    set(adminUserCarsAtom, []);
    set(adminUserLoadingAtom, true);
    set(adminUserCarsLoadingAtom, false);
    set(adminUserErrorAtom, null);
    set(adminUserActiveTabAtom, 'overview');
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
