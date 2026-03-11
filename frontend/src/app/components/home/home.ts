import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  auth = inject(AuthService);
  bookService = inject(BookService);

  // Reactive computed signals from the service — auto-update when books are fetched
  totalBooks = this.bookService.totalBooks;
  availableBooks = this.bookService.availableBooks;
  checkedOutBooks = this.bookService.checkedOutBooks;

  ngOnInit() {
    // Refresh books (signal updates automatically via service computed signals)
    this.bookService.refreshBooks().subscribe();
  }
}
