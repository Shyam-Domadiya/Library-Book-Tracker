import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, NgClass, DatePipe],
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

  transactions: Transaction[] = [];

  ngOnInit() {
    // Refresh books (signal updates automatically via service computed signals)
    this.bookService.refreshBooks().subscribe();

    if (this.auth.isLibrarian()) {
      this.bookService.getTransactions().subscribe(txs => {
        this.transactions = txs.slice(0, 5); // Show latest 5
      });
    }
  }
}
