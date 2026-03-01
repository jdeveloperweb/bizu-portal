"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CustomDialog, DialogType } from "./ui/CustomDialog";

interface DialogOptions {
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: DialogType;
}

interface DialogContextType {
    alert: (message: string, options?: DialogOptions) => Promise<void>;
    confirm: (message: string, options?: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function CustomDialogProvider({ children }: { children: ReactNode }) {
    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        type: DialogType;
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        resolve: (value: any) => void;
    } | null>(null);

    const showAlert = (message: string, options?: DialogOptions): Promise<void> => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                type: options?.type || "info",
                title: options?.title || "Aviso",
                message,
                confirmLabel: options?.confirmLabel || "OK",
                resolve: () => {
                    setDialog(null);
                    resolve();
                },
            });
        });
    };

    const showConfirm = (message: string, options?: DialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                type: options?.type || "confirm",
                title: options?.title || "Confirmar",
                message,
                confirmLabel: options?.confirmLabel || "Sim",
                cancelLabel: options?.cancelLabel || "Não",
                resolve: (value: boolean) => {
                    setDialog(null);
                    resolve(value);
                },
            });
        });
    };

    return (
        <DialogContext.Provider value={{ alert: showAlert, confirm: showConfirm }}>
            {children}
            {dialog && (
                <CustomDialog
                    isOpen={dialog.isOpen}
                    type={dialog.type}
                    title={dialog.title}
                    message={dialog.message}
                    confirmLabel={dialog.confirmLabel}
                    cancelLabel={dialog.cancelLabel}
                    onConfirm={() => dialog.resolve(true)}
                    onCancel={() => dialog.resolve(false)}
                    onClose={() => dialog.resolve(false)}
                />
            )}
        </DialogContext.Provider>
    );
}

export function useCustomDialog() {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("useCustomDialog must be used within CustomDialogProvider");
    }
    return context;
}
