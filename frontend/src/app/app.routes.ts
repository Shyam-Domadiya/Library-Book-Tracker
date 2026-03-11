import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { BookListComponent } from './components/book-list/book-list';
import { AddBook } from './components/add-book/add-book';
import { BookDetails } from './components/book-details/book-details';

import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { WishlistComponent } from './components/wishlist/wishlist';
import { HistoryComponent } from './components/history/history';
import { authGuard } from './guards/auth';
import { guestGuard } from './guards/guest';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
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
    { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
    {
        path: 'history',
        component: HistoryComponent,
        canActivate: [authGuard],
        data: { role: 'Librarian' }
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];