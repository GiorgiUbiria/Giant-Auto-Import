"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

export function Form({
  children,
  action,
}: {
  children: React.ReactNode;
  action: (
    prevState: any,
    formData: FormData,
  ) => Promise<ActionResult | undefined>;
}) {
  const [state, formAction] = useFormState(action, {
    error: null,
  });

  const prevErrorRef = useRef(state?.error);
  const prevSuccessRef = useRef(state?.success);

  useEffect(() => {
    if (prevErrorRef.current !== state?.error && state?.error) {
      toast.error(state.error);
    }
    if (prevSuccessRef.current !== state?.success && state?.success) {
      toast.success(state.success);
    }

    prevErrorRef.current = state?.error;
    prevSuccessRef.current = state?.success;
  }, [state]);

  return <form action={formAction}>{children}</form>;
}

export interface ActionResult {
  error: string | null;
  success?: string;
  data?: any;
}
