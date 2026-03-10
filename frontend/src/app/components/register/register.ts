import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Role } from '../../models/user';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, NgIf, RouterLink],
    templateUrl: './register.html',
    styleUrl: '../login/login.css', // Reusing login styles
})
export class RegisterComponent {
    name: string = '';
    username: string = '';
    password: string = '';
    selectedRole: Role = 'Student';
    errorMessage: string = '';

    constructor(private authService: AuthService, private router: Router) { }

    onRegister() {
        if (this.name && this.username && this.password) {
            this.authService.register({
                name: this.name,
                username: this.username,
                password: this.password,
                role: this.selectedRole
            }).subscribe({
                next: () => {
                    alert('Registration successful! Please login.');
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.errorMessage = err.error?.error || 'Registration failed.';
                }
            });
        } else {
            this.errorMessage = 'Please fill in all fields.';
        }
    }
}
