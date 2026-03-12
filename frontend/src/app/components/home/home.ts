import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';
import { Book } from '../../models/book';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  auth = inject(AuthService);
  bookService = inject(BookService);
  overdueBooks: Book[] = [];

  // Reactive computed signals from the service — auto-update when books are fetched
  totalBooks = this.bookService.totalBooks;
  availableBooks = this.bookService.availableBooks;
  checkedOutBooks = this.bookService.checkedOutBooks;

  ngOnInit() {
    // Refresh books (signal updates automatically via service computed signals)
    this.bookService.refreshBooks().subscribe();
    
    if (this.auth.isLibrarian()) {
      this.bookService.getOverdueBooks().subscribe(books => {
        this.overdueBooks = books;
      });
    }
  }
}
