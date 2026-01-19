'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, Website, Bookmark, MessageThread, Message } from './types';
import { mockUsers, mockBookmarks, mockMessageThreads, mockMessages } from './mockData';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
    logout: () => void;
    switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = useCallback(async (email: string, _password: string, role?: UserRole): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) { setUser(existingUser); return true; }
        const demoUser: User = { id: `user-demo-${Date.now()}`, email, name: email.split('@')[0], role: role || 'buyer', createdAt: new Date().toISOString() };
        setUser(demoUser);
        return true;
    }, []);

    const logout = useCallback(() => { setUser(null); }, []);

    const switchRole = useCallback((role: UserRole) => {
        if (user) {
            const demoUser = mockUsers.find(u => u.role === role);
            if (demoUser) { setUser(demoUser); } else { setUser({ ...user, role }); }
        }
    }, [user]);

    return (<AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>{children}</AuthContext.Provider>);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}

interface BookmarksContextType {
    bookmarks: Bookmark[];
    isBookmarked: (websiteId: string) => boolean;
    addBookmark: (website: Website) => void;
    removeBookmark: (websiteId: string) => void;
    toggleBookmark: (website: Website) => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function BookmarksProvider({ children }: { children: ReactNode }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(mockBookmarks);
    const isBookmarked = useCallback((websiteId: string) => bookmarks.some(b => b.websiteId === websiteId), [bookmarks]);
    const addBookmark = useCallback((website: Website) => {
        const newBookmark: Bookmark = { id: `bookmark-${Date.now()}`, websiteId: website.id, website, userId: 'current-user', createdAt: new Date().toISOString() };
        setBookmarks(prev => [...prev, newBookmark]);
    }, []);
    const removeBookmark = useCallback((websiteId: string) => { setBookmarks(prev => prev.filter(b => b.websiteId !== websiteId)); }, []);
    const toggleBookmark = useCallback((website: Website) => {
        if (isBookmarked(website.id)) { removeBookmark(website.id); } else { addBookmark(website); }
    }, [isBookmarked, removeBookmark, addBookmark]);
    return (<BookmarksContext.Provider value={{ bookmarks, isBookmarked, addBookmark, removeBookmark, toggleBookmark }}>{children}</BookmarksContext.Provider>);
}

export function useBookmarks() {
    const context = useContext(BookmarksContext);
    if (context === undefined) throw new Error('useBookmarks must be used within a BookmarksProvider');
    return context;
}



interface MessagesContextType {
    threads: MessageThread[];
    messages: Message[];
    getThreadMessages: (threadId: string) => Message[];
    sendMessage: (threadId: string, content: string, senderId: string) => void;
    createThread: (participants: User[], websiteId?: string) => MessageThread;
    markAsRead: (threadId: string) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
    const [threads, setThreads] = useState<MessageThread[]>(mockMessageThreads);
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const getThreadMessages = useCallback((threadId: string) => messages.filter(m => m.threadId === threadId), [messages]);
    const sendMessage = useCallback((threadId: string, content: string, senderId: string) => {
        const sender = mockUsers.find(u => u.id === senderId)!;
        const newMessage: Message = { id: `msg-${Date.now()}`, threadId, senderId, sender, content, isRead: false, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, newMessage]);
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, lastMessage: newMessage, updatedAt: newMessage.createdAt } : t));
    }, []);
    const createThread = useCallback((participants: User[], websiteId?: string): MessageThread => {
        const newThread: MessageThread = { id: `thread-${Date.now()}`, participants, websiteId, lastMessage: { id: '', threadId: '', senderId: '', sender: participants[0], content: '', isRead: true, createdAt: new Date().toISOString() }, unreadCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setThreads(prev => [...prev, newThread]);
        return newThread;
    }, []);
    const markAsRead = useCallback((threadId: string) => {
        setMessages(prev => prev.map(m => m.threadId === threadId ? { ...m, isRead: true } : m));
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));
    }, []);
    return (<MessagesContext.Provider value={{ threads, messages, getThreadMessages, sendMessage, createThread, markAsRead }}>{children}</MessagesContext.Provider>);
}

export function useMessages() {
    const context = useContext(MessagesContext);
    if (context === undefined) throw new Error('useMessages must be used within a MessagesProvider');
    return context;
}

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
interface ToastContextType { toasts: Toast[]; showToast: (message: string, type?: Toast['type']) => void; dismissToast: (id: string) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = `toast-${Date.now()}`;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
    }, []);
    const dismissToast = useCallback((id: string) => { setToasts(prev => prev.filter(t => t.id !== id)); }, []);
    return (<ToastContext.Provider value={{ toasts, showToast, dismissToast }}>{children}</ToastContext.Provider>);
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) throw new Error('useToast must be used within a ToastProvider');
    return context;
}

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ToastProvider>
                <BookmarksProvider>
                    <MessagesProvider>
                        {children}
                    </MessagesProvider>
                </BookmarksProvider>
            </ToastProvider>
        </AuthProvider>
    );
}
