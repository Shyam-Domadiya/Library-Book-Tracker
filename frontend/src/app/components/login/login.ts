import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Role } from '../../models/user';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, NgIf, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class LoginComponent {
    username: string = '';
    password: string = '';
    selectedRole: Role = 'Student';
    errorMessage: string = '';

    constructor(private authService: AuthService) { }

    onLogin() {
        if (this.username.trim() && this.password.trim()) {
            this.authService.login(this.username, this.password, this.selectedRole).subscribe({
                next: (user) => {
                    this.authService.handleLoginSuccess(user);
                },
                error: (err) => {
                    this.errorMessage = err.error?.error || 'Login failed. Invalid credentials.';
                }
            });
        } else {
            this.errorMessage = 'Please enter both username and password.';
        }
    }
}
