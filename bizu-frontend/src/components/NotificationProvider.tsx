"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Trophy } from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";

type NotificationType = "success" | "error" | "info" | "achievement";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    notify: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = (title: string, message: string, type: NotificationType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    };

    const remove = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                w-80 md:w-96 p-5 rounded-[28px] border shadow-2xl backdrop-blur-xl flex items-start gap-4 relative overflow-hidden
                ${n.type === "success" ? "bg-success/5 border-success/20 text-success" :
                                    n.type === "error" ? "bg-danger/5 border-danger/20 text-danger" :
                                        n.type === "achievement" ? "bg-primary/10 border-primary/20 text-primary border-2" : "bg-card/80 border-border"}
              `}>
                                {n.type === "achievement" && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-xl animate-pulse" />
                                )}

                                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                    ${n.type === "success" ? "bg-success/10" :
                                        n.type === "error" ? "bg-danger/10" :
                                            n.type === "achievement" ? "bg-primary shadow-lg shadow-primary/30 text-white" : "bg-muted"}
                `}>
                                    {n.type === "success" && <CheckCircle2 className="w-6 h-6" />}
                                    {n.type === "error" && <AlertCircle className="w-6 h-6" />}
                                    {n.type === "achievement" && <Trophy className="w-6 h-6" />}
                                    {n.type === "info" && <Info className="w-6 h-6" />}
                                </div>

                                <div className="flex-1 pr-4">
                                    <h4 className="font-black text-sm uppercase tracking-tight mb-1">{n.title}</h4>
                                    <p className="text-xs font-medium opacity-80 leading-relaxed text-foreground">{n.message}</p>
                                </div>

                                <button
                                    onClick={() => remove(n.id)}
                                    className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used within NotificationProvider");
    return context;
};
