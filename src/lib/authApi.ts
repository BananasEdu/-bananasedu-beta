/**
 * BananasEdu Beta - Auth API Service
 * Handles communication with Google Apps Script backend
 */

// API URL from environment or fallback
const API_URL = import.meta.env.VITE_API_URL || '';

// Local storage keys
const TOKEN_KEY = 'bananasedu_beta_token';
const USER_KEY = 'bananasedu_beta_user';

// Types
export interface User {
    id: string;
    username: string;
    fullName: string;
    schoolLevel: string;
    schoolName: string;
    classLevel: string;
    major: string;
    className: string;
    role?: 'student' | 'admin';
}

export interface RegisterData {
    username: string;
    fullName: string;
    password: string;
    schoolLevel: string;
    schoolStatus: string;
    schoolName: string;
    classLevel: string;
    major?: string;
    className: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
    user?: User;
    token?: string;
}

// ================== Helper Functions ==================

/**
 * Make POST request to API
 */
async function apiPost(data: object): Promise<ApiResponse> {
    if (!API_URL) {
        throw new Error('API URL belum dikonfigurasi. Set VITE_API_URL di file .env');
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain', // Required for Google Apps Script
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Koneksi ke server gagal. Coba lagi nanti.');
    }
}

// ================== Auth Functions ==================

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<ApiResponse> {
    return apiPost({
        action: 'register',
        ...data,
    });
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<ApiResponse> {
    const result = await apiPost({
        action: 'login',
        ...data,
    });

    // Store session if successful
    if (result.success && result.user && result.token) {
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    }

    return result;
}

/**
 * Logout user
 */
export function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get stored token
 */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user
 */
export function getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken() && !!getStoredUser();
}

/**
 * Check API connection (for testing)
 */
export async function checkApiConnection(): Promise<boolean> {
    if (!API_URL) return false;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.success === true;
    } catch {
        return false;
    }
}

/**
 * Check if username is available
 */
export async function checkUsername(username: string): Promise<{ success: boolean; available?: boolean; error?: string }> {
    return apiPost({
        action: 'checkUsername',
        username,
    });
}

