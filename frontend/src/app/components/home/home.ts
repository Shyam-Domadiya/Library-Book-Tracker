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
  totalBooks = 0;
  availableBooks = 0;
  checkedOutBooks = 0;
  transactions: Transaction[] = [];

  constructor(private bookService: BookService) { }

  ngOnInit() {
    const books = this.bookService.getBooks();
    this.totalBooks = books.length;
    this.availableBooks = books.filter(b => b.available).length;
    this.checkedOutBooks = this.totalBooks - this.availableBooks;

    if (this.auth.isLibrarian()) {
      this.bookService.getTransactions().subscribe(txs => {
        this.transactions = txs.slice(0, 5); // Show latest 5
      });
    }
  }
}
