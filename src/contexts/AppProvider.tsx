import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { MessageProvider } from './MessageContext';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MessageProvider>
          {children}
        </MessageProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
