"use client";

import { ReactNode, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import {
  alertDialogAtom,
  dialogAtom,
  closeAlertDialogAtom,
  closeDialogAtom,
  confirmAlertDialogAtom,
} from '@/lib/dialog-atoms';
import { useDialogStateAndActions } from '@/lib/hooks/use-dialog-state';

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider = ({ children }: DialogProviderProps) => {
  const { alertDialog, dialog, closeAlertDialog, closeDialog, confirmAlertDialog } = useDialogStateAndActions();

  // Handle escape key to close dialogs
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (alertDialog.isOpen) {
          closeAlertDialog();
        } else if (dialog.isOpen) {
          closeDialog();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [alertDialog.isOpen, dialog.isOpen, closeAlertDialog, closeDialog]);

  // Get icon based on dialog type
  const getDialogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
  };

  // Get button variant based on dialog variant
  const getButtonVariant = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <>
      {children}
      
      {/* Global Alert Dialog */}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={(open) => !open && closeAlertDialog()}>
        <AlertDialogContent className="max-w-md">
          {alertDialog.data && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  {getDialogIcon(alertDialog.data.type)}
                  {alertDialog.data.title}
                </AlertDialogTitle>
                {alertDialog.data.description && (
                  <AlertDialogDescription className="text-left">
                    {alertDialog.data.description}
                  </AlertDialogDescription>
                )}
              </AlertDialogHeader>
              
              <AlertDialogFooter>
                {alertDialog.data.cancelText && (
                  <AlertDialogCancel onClick={alertDialog.data.onCancel}>
                    {alertDialog.data.cancelText}
                  </AlertDialogCancel>
                )}
                {alertDialog.data.confirmText && (
                  <AlertDialogAction
                    onClick={confirmAlertDialog}
                    className={getButtonVariant(alertDialog.data.variant)}
                  >
                    {alertDialog.data.confirmText}
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Regular Dialog */}
      <Dialog open={dialog.isOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          {dialog.data && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getDialogIcon(dialog.data.type)}
                  {dialog.data.title}
                </DialogTitle>
                {dialog.data.description && (
                  <DialogDescription className="text-left">
                    {dialog.data.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <DialogFooter>
                {dialog.data.cancelText && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      dialog.data?.onCancel?.();
                      closeDialog();
                    }}
                  >
                    {dialog.data.cancelText}
                  </Button>
                )}
                {dialog.data.confirmText && (
                  <Button
                    onClick={() => {
                      dialog.data?.onConfirm?.();
                      closeDialog();
                    }}
                    variant={getButtonVariant(dialog.data.variant)}
                  >
                    {dialog.data.confirmText}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}; 