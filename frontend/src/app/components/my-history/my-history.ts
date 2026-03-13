import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';
import { Transaction } from '../../models/transaction';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-my-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-history.html',
  styleUrl: './my-history.css'
})
export class MyHistoryComponent implements OnInit {
  authService = inject(AuthService);
  private bookService = inject(BookService);

  transactions$!: Observable<Transaction[]>;

  ngOnInit(): void {
    const studentId = this.authService.currentUser()?.id;
    if (studentId) {
      this.transactions$ = this.bookService.getTransactions(studentId);
    }
  }
}
