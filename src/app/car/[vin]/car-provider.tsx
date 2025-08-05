"use client";

import { Provider } from 'jotai';
import { ReactNode } from 'react';

interface CarProviderProps {
  children: ReactNode;
}

export const CarProvider = ({ children }: CarProviderProps) => {
  return (
    <Provider>
      {children}
    </Provider>
  );
}; 