"use client";

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  // State atoms
  alertDialogAtom,
  dialogAtom,
  modalAtom,
  lightboxAtom,
  dialogHistoryAtom,
  dialogSettingsAtom,
  dialogQueueAtom,
  
  // Action atoms
  openAlertDialogAtom,
  closeAlertDialogAtom,
  confirmAlertDialogAtom,
  openDialogAtom,
  closeDialogAtom,
  openModalAtom,
  closeModalAtom,
  openLightboxAtom,
  closeLightboxAtom,
  
  // Utility atoms
  showDeleteConfirmationAtom,
  showErrorDialogAtom,
  showSuccessDialogAtom,
  showInfoDialogAtom,
  resetAllDialogsAtom,
  
  // Derived atoms
  isAnyDialogOpenAtom,
  currentDialogAtom,
  
  // Queue atoms
  addToDialogQueueAtom,
  removeFromDialogQueueAtom,
  processNextDialogAtom,
  
  // Types
  type DialogData,
  type DialogType,
} from '@/lib/dialog-atoms';

export const useDialogState = () => {
  return {
    // Alert dialog state
    alertDialog: useAtomValue(alertDialogAtom),
    
    // Regular dialog state
    dialog: useAtomValue(dialogAtom),
    
    // Modal state
    modal: useAtomValue(modalAtom),
    
    // Lightbox state
    lightbox: useAtomValue(lightboxAtom),
    
    // Dialog history
    dialogHistory: useAtomValue(dialogHistoryAtom),
    
    // Dialog settings
    dialogSettings: useAtomValue(dialogSettingsAtom),
    
    // Dialog queue
    dialogQueue: useAtomValue(dialogQueueAtom),
    
    // Derived states
    isAnyDialogOpen: useAtomValue(isAnyDialogOpenAtom),
    currentDialog: useAtomValue(currentDialogAtom),
  };
};

export const useDialogActions = () => {
  return {
    // Alert dialog actions
    openAlertDialog: useSetAtom(openAlertDialogAtom),
    closeAlertDialog: useSetAtom(closeAlertDialogAtom),
    confirmAlertDialog: useSetAtom(confirmAlertDialogAtom),
    
    // Regular dialog actions
    openDialog: useSetAtom(openDialogAtom),
    closeDialog: useSetAtom(closeDialogAtom),
    
    // Modal actions
    openModal: useSetAtom(openModalAtom),
    closeModal: useSetAtom(closeModalAtom),
    
    // Lightbox actions
    openLightbox: useSetAtom(openLightboxAtom),
    closeLightbox: useSetAtom(closeLightboxAtom),
    
    // Utility actions
    showDeleteConfirmation: useSetAtom(showDeleteConfirmationAtom),
    showErrorDialog: useSetAtom(showErrorDialogAtom),
    showSuccessDialog: useSetAtom(showSuccessDialogAtom),
    showInfoDialog: useSetAtom(showInfoDialogAtom),
    resetAllDialogs: useSetAtom(resetAllDialogsAtom),
    
    // Queue actions
    addToDialogQueue: useSetAtom(addToDialogQueueAtom),
    removeFromDialogQueue: useSetAtom(removeFromDialogQueueAtom),
    processNextDialog: useSetAtom(processNextDialogAtom),
  };
};

export const useDialogStateAndActions = () => {
  const state = useDialogState();
  const actions = useDialogActions();
  
  return {
    ...state,
    ...actions,
  };
};

// Specialized hooks for specific dialog types
export const useAlertDialog = () => {
  const [alertDialog, setAlertDialog] = useAtom(alertDialogAtom);
  
  const openAlertDialog = useSetAtom(openAlertDialogAtom);
  const closeAlertDialog = useSetAtom(closeAlertDialogAtom);
  const confirmAlertDialog = useSetAtom(confirmAlertDialogAtom);
  
  return {
    alertDialog,
    openAlertDialog,
    closeAlertDialog,
    confirmAlertDialog,
  };
};

export const useRegularDialog = () => {
  const [dialog, setDialog] = useAtom(dialogAtom);
  
  const openDialog = useSetAtom(openDialogAtom);
  const closeDialog = useSetAtom(closeDialogAtom);
  
  return {
    dialog,
    openDialog,
    closeDialog,
  };
};

export const useModal = () => {
  const [modal, setModal] = useAtom(modalAtom);
  
  const openModal = useSetAtom(openModalAtom);
  const closeModal = useSetAtom(closeModalAtom);
  
  return {
    modal,
    openModal,
    closeModal,
  };
};

export const useLightbox = () => {
  const [lightbox, setLightbox] = useAtom(lightboxAtom);
  
  const openLightbox = useSetAtom(openLightboxAtom);
  const closeLightbox = useSetAtom(closeLightboxAtom);
  
  return {
    lightbox,
    openLightbox,
    closeLightbox,
  };
};

// Convenience hooks for common patterns
export const useDeleteConfirmation = () => {
  const showDeleteConfirmation = useSetAtom(showDeleteConfirmationAtom);
  
  const confirmDelete = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void,
    variant: 'default' | 'destructive' | 'warning' = 'destructive',
    data?: Record<string, any>
  ) => {
    showDeleteConfirmation({
      title,
      description,
      onConfirm,
      onCancel,
      variant,
      data,
    });
  };
  
  return { confirmDelete };
};

export const useErrorDialog = () => {
  const showErrorDialog = useSetAtom(showErrorDialogAtom);
  
  const showError = (
    description: string,
    title?: string,
    onClose?: () => void
  ) => {
    showErrorDialog({
      title,
      description,
      onClose,
    });
  };
  
  return { showError };
};

export const useSuccessDialog = () => {
  const showSuccessDialog = useSetAtom(showSuccessDialogAtom);
  
  const showSuccess = (
    description: string,
    title?: string,
    onClose?: () => void
  ) => {
    showSuccessDialog({
      title,
      description,
      onClose,
    });
  };
  
  return { showSuccess };
};

export const useInfoDialog = () => {
  const showInfoDialog = useSetAtom(showInfoDialogAtom);
  
  const showInfo = (
    description: string,
    title?: string,
    onClose?: () => void
  ) => {
    showInfoDialog({
      title,
      description,
      onClose,
    });
  };
  
  return { showInfo };
};

// Hook for managing dialog queue
export const useDialogQueue = () => {
  const dialogQueue = useAtomValue(dialogQueueAtom);
  const addToDialogQueue = useSetAtom(addToDialogQueueAtom);
  const removeFromDialogQueue = useSetAtom(removeFromDialogQueueAtom);
  const processNextDialog = useSetAtom(processNextDialogAtom);
  
  const addToQueue = (dialogData: DialogData) => {
    addToDialogQueue(dialogData);
  };
  
  const removeFromQueue = (dialogId: string) => {
    removeFromDialogQueue(dialogId);
  };
  
  const processNext = () => {
    processNextDialog();
  };
  
  return {
    queue: dialogQueue,
    addToQueue,
    removeFromQueue,
    processNext,
    hasQueuedDialogs: dialogQueue.length > 0,
  };
}; 