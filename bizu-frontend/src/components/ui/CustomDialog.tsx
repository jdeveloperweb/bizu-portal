"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, HelpCircle, X } from "lucide-react";

export type DialogType = "info" | "success" | "warning" | "danger" | "confirm";

interface CustomDialogProps {
    isOpen: boolean;
    type?: DialogType;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    onClose: () => void;
}

const icons = {
    info: <Info className="w-8 h-8 text-blue-500" />,
    success: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
    warning: <AlertCircle className="w-8 h-8 text-amber-500" />,
    danger: <AlertCircle className="w-8 h-8 text-rose-500" />,
    confirm: <HelpCircle className="w-8 h-8 text-indigo-500" />,
};

export const CustomDialog: React.FC<CustomDialogProps> = ({
    isOpen,
    type = "info",
    title,
    message,
    confirmLabel = "OK",
    cancelLabel = "Cancelar",
    onConfirm,
    onCancel,
    onClose,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Dialog Container */}
                    <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-card/95 border border-border/50 shadow-2xl rounded-[32px] overflow-hidden pointer-events-auto backdrop-blur-xl"
                        >
                            <div className="p-8 flex flex-col items-center text-center">
                                {/* Icon Circle */}
                                <div className="mb-6 w-16 h-16 rounded-3xl bg-muted/30 flex items-center justify-center">
                                    {icons[type]}
                                </div>

                                <h3 className="text-xl font-extrabold tracking-tight mb-2 text-foreground">
                                    {title}
                                </h3>

                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    {message}
                                </p>

                                <div className="mt-8 flex flex-col w-full gap-3">
                                    <button
                                        onClick={onConfirm}
                                        className={`
                      w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95
                      ${type === 'danger'
                                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                                                : 'bg-primary text-white shadow-lg shadow-primary/25'}
                    `}
                                    >
                                        {confirmLabel}
                                    </button>

                                    {type === "confirm" && onCancel && (
                                        <button
                                            onClick={onCancel}
                                            className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-muted-foreground hover:bg-muted transition-all active:scale-95"
                                        >
                                            {cancelLabel}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Close Button Top Right */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-muted-foreground/50 hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
