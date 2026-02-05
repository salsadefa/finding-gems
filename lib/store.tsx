'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, UserRole, Website, Bookmark, MessageThread, Message } from './types';
import { mockMessageThreads, mockMessages } from './mockData';
import { 
  useBookmarks as useBookmarksQuery, 
  useCreateBookmark as useCreateBookmarkMutation, 
  useDeleteBookmark as useDeleteBookmarkMutation,
  useToggleBookmark as useToggleBookmarkMutation 
} from './api/bookmarks';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            if (typeof window !== 'undefined') {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const userData = JSON.parse(userStr);
                        setUser(userData);
                    } catch (e) {
                        console.error('Failed to parse user data', e);
                        localStorage.removeItem('user');
                    }
                }
                setIsLoading(false);
            }
        };

        loadUser();

        // Listen for storage changes (for multi-tab support)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user') {
                if (e.newValue) {
                    setUser(JSON.parse(e.newValue));
                } else {
                    setUser(null);
                }
            }
        };

        // Listen for custom auth-update event (for same-tab login/register)
        // StorageEvent doesn't fire in the same tab, so we use a custom event
        const handleAuthUpdate = (e: CustomEvent<{ user: User | null }>) => {
            setUser(e.detail.user);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-update', handleAuthUpdate as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-update', handleAuthUpdate as EventListener);
        };
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            isLoading,
            logout, 
            setUser 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}

interface BookmarksContextType {
    bookmarks: Bookmark[];
    isLoading: boolean;
    isBookmarked: (websiteId: string) => boolean;
    addBookmark: (website: Website) => void;
    removeBookmark: (websiteId: string) => void;
    toggleBookmark: (website: Website) => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function BookmarksProvider({ children }: { children: ReactNode }) {
    // Use the real API hooks
    const { data: bookmarks = [], isLoading } = useBookmarksQuery();
    const createBookmark = useCreateBookmarkMutation();
    const deleteBookmark = useDeleteBookmarkMutation();
    const toggleBookmarkMutation = useToggleBookmarkMutation();

    const isBookmarked = useCallback((websiteId: string) => 
        bookmarks.some(b => b.websiteId === websiteId), 
    [bookmarks]);

    const addBookmark = useCallback((website: Website) => {
        createBookmark.mutate(website.id);
    }, [createBookmark]);

    const removeBookmark = useCallback((websiteId: string) => {
        const bookmark = bookmarks.find(b => b.websiteId === websiteId);
        if (bookmark) {
            deleteBookmark.mutate({ id: bookmark.id, websiteId });
        }
    }, [bookmarks, deleteBookmark]);

    const toggleBookmark = useCallback((website: Website) => {
        const existingBookmark = bookmarks.find(b => b.websiteId === website.id);
        toggleBookmarkMutation.mutate({
            websiteId: website.id,
            isBookmarked: !!existingBookmark,
            bookmarkId: existingBookmark?.id,
        });
    }, [bookmarks, toggleBookmarkMutation]);

    return (
        <BookmarksContext.Provider value={{ 
            bookmarks, 
            isLoading,
            isBookmarked, 
            addBookmark, 
            removeBookmark, 
            toggleBookmark 
        }}>
            {children}
        </BookmarksContext.Provider>
    );
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
    sendMessage: (threadId: string, content: string, senderId: string, sender: User) => void;
    createThread: (participants: User[], websiteId?: string) => MessageThread;
    markAsRead: (threadId: string) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
    const [threads, setThreads] = useState<MessageThread[]>(mockMessageThreads);
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const getThreadMessages = useCallback((threadId: string) => messages.filter(m => m.threadId === threadId), [messages]);
    const sendMessage = useCallback((threadId: string, content: string, senderId: string, sender: User) => {
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
