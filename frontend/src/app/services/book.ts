import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../models/book';
import { Transaction } from '../models/transaction';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:5000/api/books';
  private http = inject(HttpClient);

  // Using a signal for the books list
  private booksSignal = signal<Book[]>([]);

  constructor() {
    this.refreshBooks();
  }

  getBooks() {
    return this.booksSignal();
  }

  refreshBooks() {
    this.http.get<Book[]>(this.apiUrl).subscribe(books => {
      this.booksSignal.set(books);
    });
  }

  getBookById(id: number) {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  addBook(book: Book) {
    this.http.post<Book>(this.apiUrl, book).subscribe(() => {
      this.refreshBooks();
    });
  }

  updateBookStatus(id: number) {
    const book = this.getBooks().find(b => b.id === id);
    if (book) {
      this.http.put(`${this.apiUrl}/${id}`, { ...book, available: !book.available }).subscribe(() => {
        this.refreshBooks();
      });
    }
  }

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:5000/api/users/students');
  }

  issueBook(bookId: number, studentId: string) {
    this.http.post(`${this.apiUrl.replace('/books', '/transactions/issue')}`, { bookId, studentId }).subscribe(() => {
      this.refreshBooks();
    });
  }

  returnBook(bookId: number) {
    this.http.post(`${this.apiUrl.replace('/books', '/transactions/return')}`, { bookId }).subscribe(() => {
      this.refreshBooks();
    });
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl.replace('/books', '/transactions'));
  }

  deleteBook(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.refreshBooks();
    });
  }
}