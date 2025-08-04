import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Dialog types
export type DialogType = 
  | 'delete-car'
  | 'delete-user'
  | 'delete-csv-version'
  | 'delete-image'
  | 'update-profile'
  | 'user-pricing'
  | 'image-upload'
  | 'lightbox'
  | 'settings'
  | 'confirm-action'
  | 'error'
  | 'success'
  | 'info';

// Dialog data interface
export interface DialogData {
  id: string;
  type: DialogType;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  data?: Record<string, any>;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

// Alert dialog state
export interface AlertDialogState {
  isOpen: boolean;
  data: DialogData | null;
}

// Regular dialog state
export interface DialogState {
  isOpen: boolean;
  data: DialogData | null;
}

// Modal state
export interface ModalState {
  isOpen: boolean;
  data: DialogData | null;
}

// Lightbox state
export interface LightboxState {
  isOpen: boolean;
  startIndex: number;
  slides: any[];
}

// Centralized dialog atoms
export const alertDialogAtom = atom<AlertDialogState>({
  isOpen: false,
  data: null,
});

export const dialogAtom = atom<DialogState>({
  isOpen: false,
  data: null,
});

export const modalAtom = atom<ModalState>({
  isOpen: false,
  data: null,
});

export const lightboxAtom = atom<LightboxState>({
  isOpen: false,
  startIndex: 0,
  slides: [],
});

// Dialog history for navigation
export const dialogHistoryAtom = atom<DialogData[]>([]);

// Global dialog settings
export const dialogSettingsAtom = atomWithStorage('dialog-settings', {
  confirmOnEnter: true,
  closeOnEscape: true,
  closeOnOverlayClick: true,
  animationDuration: 200,
  maxWidth: 'md',
});

// Action atoms for alert dialogs
export const openAlertDialogAtom = atom(
  null,
  (get, set, data: DialogData) => {
    set(alertDialogAtom, {
      isOpen: true,
      data,
    });
    
    // Add to history
    const history = get(dialogHistoryAtom);
    set(dialogHistoryAtom, [...history, data]);
  }
);

export const closeAlertDialogAtom = atom(
  null,
  (get, set) => {
    set(alertDialogAtom, {
      isOpen: false,
      data: null,
    });
  }
);

export const confirmAlertDialogAtom = atom(
  null,
  async (get, set) => {
    const state = get(alertDialogAtom);
    if (state.data?.onConfirm) {
      await state.data.onConfirm();
    }
    set(alertDialogAtom, {
      isOpen: false,
      data: null,
    });
  }
);

// Action atoms for regular dialogs
export const openDialogAtom = atom(
  null,
  (get, set, data: DialogData) => {
    set(dialogAtom, {
      isOpen: true,
      data,
    });
    
    // Add to history
    const history = get(dialogHistoryAtom);
    set(dialogHistoryAtom, [...history, data]);
  }
);

export const closeDialogAtom = atom(
  null,
  (get, set) => {
    set(dialogAtom, {
      isOpen: false,
      data: null,
    });
  }
);

// Action atoms for modals
export const openModalAtom = atom(
  null,
  (get, set, data: DialogData) => {
    set(modalAtom, {
      isOpen: true,
      data,
    });
    
    // Add to history
    const history = get(dialogHistoryAtom);
    set(dialogHistoryAtom, [...history, data]);
  }
);

export const closeModalAtom = atom(
  null,
  (get, set) => {
    set(modalAtom, {
      isOpen: false,
      data: null,
    });
  }
);

// Action atoms for lightbox
export const openLightboxAtom = atom(
  null,
  (get, set, slides: any[], startIndex: number = 0) => {
    set(lightboxAtom, {
      isOpen: true,
      startIndex,
      slides,
    });
  }
);

export const closeLightboxAtom = atom(
  null,
  (get, set) => {
    set(lightboxAtom, {
      isOpen: false,
      startIndex: 0,
      slides: [],
    });
  }
);

// Utility atoms for common dialog patterns
export const showDeleteConfirmationAtom = atom(
  null,
  (get, set, {
    title,
    description,
    onConfirm,
    onCancel,
    variant = 'destructive',
    data = {},
  }: {
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    variant?: 'default' | 'destructive' | 'warning';
    data?: Record<string, any>;
  }) => {
    const dialogData: DialogData = {
      id: `delete-${Date.now()}`,
      type: 'confirm-action',
      title,
      description,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant,
      data,
      onConfirm,
      onCancel,
    };
    
    set(alertDialogAtom, {
      isOpen: true,
      data: dialogData,
    });
  }
);

export const showErrorDialogAtom = atom(
  null,
  (get, set, {
    title = 'Error',
    description,
    onClose,
  }: {
    title?: string;
    description: string;
    onClose?: () => void;
  }) => {
    const dialogData: DialogData = {
      id: `error-${Date.now()}`,
      type: 'error',
      title,
      description,
      confirmText: 'OK',
      variant: 'destructive',
      onConfirm: onClose,
    };
    
    set(alertDialogAtom, {
      isOpen: true,
      data: dialogData,
    });
  }
);

export const showSuccessDialogAtom = atom(
  null,
  (get, set, {
    title = 'Success',
    description,
    onClose,
  }: {
    title?: string;
    description: string;
    onClose?: () => void;
  }) => {
    const dialogData: DialogData = {
      id: `success-${Date.now()}`,
      type: 'success',
      title,
      description,
      confirmText: 'OK',
      variant: 'default',
      onConfirm: onClose,
    };
    
    set(alertDialogAtom, {
      isOpen: true,
      data: dialogData,
    });
  }
);

export const showInfoDialogAtom = atom(
  null,
  (get, set, {
    title = 'Information',
    description,
    onClose,
  }: {
    title?: string;
    description: string;
    onClose?: () => void;
  }) => {
    const dialogData: DialogData = {
      id: `info-${Date.now()}`,
      type: 'info',
      title,
      description,
      confirmText: 'OK',
      variant: 'default',
      onConfirm: onClose,
    };
    
    set(alertDialogAtom, {
      isOpen: true,
      data: dialogData,
    });
  }
);

// Reset all dialogs
export const resetAllDialogsAtom = atom(
  null,
  (get, set) => {
    set(alertDialogAtom, { isOpen: false, data: null });
    set(dialogAtom, { isOpen: false, data: null });
    set(modalAtom, { isOpen: false, data: null });
    set(lightboxAtom, { isOpen: false, startIndex: 0, slides: [] });
    set(dialogHistoryAtom, []);
  }
);

// Derived atoms for dialog state
export const isAnyDialogOpenAtom = atom((get) => {
  const alertDialog = get(alertDialogAtom);
  const dialog = get(dialogAtom);
  const modal = get(modalAtom);
  const lightbox = get(lightboxAtom);
  
  return alertDialog.isOpen || dialog.isOpen || modal.isOpen || lightbox.isOpen;
});

export const currentDialogAtom = atom((get) => {
  const alertDialog = get(alertDialogAtom);
  const dialog = get(dialogAtom);
  const modal = get(modalAtom);
  
  if (alertDialog.isOpen) return { type: 'alert', data: alertDialog.data };
  if (dialog.isOpen) return { type: 'dialog', data: dialog.data };
  if (modal.isOpen) return { type: 'modal', data: modal.data };
  
  return null;
});

// Dialog queue for managing multiple dialogs
export const dialogQueueAtom = atom<DialogData[]>([]);

export const addToDialogQueueAtom = atom(
  null,
  (get, set, dialogData: DialogData) => {
    const queue = get(dialogQueueAtom);
    set(dialogQueueAtom, [...queue, dialogData]);
  }
);

export const removeFromDialogQueueAtom = atom(
  null,
  (get, set, dialogId: string) => {
    const queue = get(dialogQueueAtom);
    set(dialogQueueAtom, queue.filter(dialog => dialog.id !== dialogId));
  }
);

export const processNextDialogAtom = atom(
  null,
  (get, set) => {
    const queue = get(dialogQueueAtom);
    if (queue.length > 0) {
      const nextDialog = queue[0];
      set(dialogQueueAtom, queue.slice(1));
      
      // Open the next dialog based on its type
      if (nextDialog.type === 'confirm-action' || nextDialog.type === 'error' || nextDialog.type === 'success' || nextDialog.type === 'info') {
        set(alertDialogAtom, { isOpen: true, data: nextDialog });
      } else {
        set(dialogAtom, { isOpen: true, data: nextDialog });
      }
    }
  }
); 