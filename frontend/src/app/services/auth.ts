import { Injectable, signal, inject } from '@angular/core';
import { User, Role } from '../models/user';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private STORAGE_KEY = 'lib_tracker_user';
    private apiUrl = 'http://localhost:5000/api/auth';
    private http = inject(HttpClient);
    currentUser = signal<User | null>(null);

    constructor(private router: Router) {
        this.loadUser();
    }

    register(user: any) {
        return this.http.post(`${this.apiUrl}/register`, user);
    }

    login(username: string, password: string, role: Role) {
        return this.http.post<User>(`${this.apiUrl}/login`, { username, password, role });
    }

    handleLoginSuccess(user: User) {
        this.currentUser.set(user);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this.router.navigate(['/home']);
    }

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem(this.STORAGE_KEY);
        this.router.navigate(['/login']);
    }

    private loadUser() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            this.currentUser.set(JSON.parse(data));
        }
    }

    isLibrarian(): boolean {
        return this.currentUser()?.role === 'Librarian';
    }

    isAuthenticated(): boolean {
        return this.currentUser() !== null;
    }
}
