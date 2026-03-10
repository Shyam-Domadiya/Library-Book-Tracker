import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { BookListComponent } from './components/book-list/book-list';
import { AddBook } from './components/add-book/add-book';
import { BookDetails } from './components/book-details/book-details';
import { About } from './components/about/about';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'home', component: Home, canActivate: [authGuard] },
    { path: 'books', component: BookListComponent, canActivate: [authGuard] },
    {
        path: 'add-book',
        component: AddBook,
        canActivate: [authGuard],
        data: { role: 'Librarian' }
    },
    {
        path: 'edit-book/:id',
        component: AddBook,
        canActivate: [authGuard],
        data: { role: 'Librarian' }
    },
    { path: 'book/:id', component: BookDetails, canActivate: [authGuard] },
    { path: 'about', component: About, canActivate: [authGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];