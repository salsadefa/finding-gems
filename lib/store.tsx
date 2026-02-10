'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, UserRole, Website, Bookmark, MessageThread, Message } from './types';
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
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { showToast } = useToast();

    // Use the real API hooks
    const { data: bookmarks = [], isLoading } = useBookmarksQuery({ enabled: isAuthenticated && !isAuthLoading });
    const createBookmark = useCreateBookmarkMutation();
    const deleteBookmark = useDeleteBookmarkMutation();
    const toggleBookmarkMutation = useToggleBookmarkMutation();

    const isBookmarked = useCallback((websiteId: string) => 
        bookmarks.some(b => b.websiteId === websiteId), 
    [bookmarks]);

    const addBookmark = useCallback((website: Website) => {
        if (!isAuthenticated) {
            showToast('Log in to save tools to your bookmarks.', 'info');
            return;
        }
        createBookmark.mutate(website.id);
    }, [createBookmark, isAuthenticated, showToast]);

    const removeBookmark = useCallback((websiteId: string) => {
        if (!isAuthenticated) {
            showToast('Log in to manage bookmarks.', 'info');
            return;
        }
        const bookmark = bookmarks.find(b => b.websiteId === websiteId);
        if (bookmark) {
            deleteBookmark.mutate({ id: bookmark.id, websiteId });
        }
    }, [bookmarks, deleteBookmark, isAuthenticated, showToast]);

    const toggleBookmark = useCallback((website: Website) => {
        if (!isAuthenticated) {
            showToast('Log in to save tools to your bookmarks.', 'info');
            return;
        }
        const existingBookmark = bookmarks.find(b => b.websiteId === website.id);
        toggleBookmarkMutation.mutate({
            websiteId: website.id,
            isBookmarked: !!existingBookmark,
            bookmarkId: existingBookmark?.id,
        });
    }, [bookmarks, toggleBookmarkMutation, isAuthenticated, showToast]);

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
                    {children}
                </BookmarksProvider>
            </ToastProvider>
        </AuthProvider>
    );
}
