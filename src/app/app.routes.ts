import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { BookListComponent } from './components/book-list/book-list';
import { AddBook } from './components/add-book/add-book';
import { BookDetails } from './components/book-details/book-details';
import { About } from './components/about/about';

export const routes: Routes = [

    { path: 'home', component: Home },
    { path: 'books', component: BookListComponent },
    { path: 'add-book', component: AddBook },
    { path: 'edit-book/:id', component: AddBook },
    { path: 'book/:id', component: BookDetails },
    { path: 'about', component: About },

    { path: '', redirectTo: 'home', pathMatch: 'full' }

];