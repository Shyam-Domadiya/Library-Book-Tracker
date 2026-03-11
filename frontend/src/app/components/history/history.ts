import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Transaction {
  _id?: string;
  bookId: number;
  bookTitle: string;
  studentId: string;
  studentName: string;
  type: 'ISSUE' | 'RETURN';
  date: string;
  createdAt?: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryComponent implements OnInit {
  private http = inject(HttpClient);
  transactions: Transaction[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.http.get<Transaction[]>('http://localhost:5000/api/transactions').subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
        this.error = 'Failed to load history records.';
        this.loading = false;
      }
    });
  }
}
