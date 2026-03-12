import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../models/book';
import { Transaction } from '../models/transaction';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:5000/api/books';
  private http = inject(HttpClient);

  // Using a signal for the books list
  private booksSignal = signal<Book[]>([]);

  // Computed signals – components bind to these directly
  readonly totalBooks = computed(() => this.booksSignal().length);
  readonly availableBooks = computed(() => this.booksSignal().filter(b => b.available).length);
  readonly checkedOutBooks = computed(() => this.totalBooks() - this.availableBooks());

  constructor() { }

  getBooks() {
    return this.booksSignal();
  }

  refreshBooks(filters?: { search?: string; category?: string; availability?: string }): Observable<Book[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params['search'] = filters.search;
    if (filters?.category) params['category'] = filters.category;
    if (filters?.availability) params['availability'] = filters.availability;

    return this.http.get<Book[]>(this.apiUrl, { params }).pipe(
      tap(books => this.booksSignal.set(books)),
      catchError(err => {
        console.error('Failed to fetch books:', err);
        return throwError(() => err);
      })
    );
  }

  getBookById(id: number | string) {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  getOverdueBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/overdue`).pipe(
      catchError(err => {
        console.error('Failed to fetch overdue books:', err);
        return throwError(() => err);
      })
    );
  }

  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book).pipe(
      tap(() => this.refreshBooks().subscribe()),
      catchError(err => {
        console.error('Failed to add book:', err);
        return throwError(() => err);
      })
    );
  }

  updateBook(id: number | string, data: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.refreshBooks().subscribe()),
      catchError(err => {
        console.error('Failed to update book:', err);
        return throwError(() => err);
      })
    );
  }

  updateBookStatus(id: number) {
    const book = this.getBooks().find(b => b.id === id);
    if (book) {
      this.updateBook(id, { ...book, available: !book.available }).subscribe();
    }
  }

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:5000/api/users/students').pipe(
      catchError(err => {
        console.error('Failed to fetch students:', err);
        return throwError(() => err);
      })
    );
  }

  issueBook(bookId: number | string, studentId: string): Observable<any> {
    return this.http.post(`http://localhost:5000/api/transactions/issue`, { bookId, studentId }).pipe(
      tap(() => this.refreshBooks().subscribe()),
      catchError(err => {
        console.error('Failed to issue book:', err);
        return throwError(() => err);
      })
    );
  }

  returnBook(bookId: number | string, userId?: string, role?: string): Observable<any> {
    const payload = userId && role ? { bookId, userId, role } : { bookId };
    return this.http.post(`http://localhost:5000/api/transactions/return`, payload).pipe(
      tap(() => this.refreshBooks().subscribe()),
      catchError(err => {
        console.error('Failed to return book:', err);
        return throwError(() => err);
      })
    );
  }

  extendBook(bookId: number | string, userId: string, newDueDate?: string): Observable<any> {
    return this.http.post(`http://localhost:5000/api/transactions/extend`, { bookId, userId, newDueDate }).pipe(
      tap(() => this.refreshBooks().subscribe()),
      catchError(err => {
        console.error('Failed to extend book due date:', err);
        return throwError(() => err);
      })
    );
  }

  toggleWishlist(bookId: number | string, userId: string): Observable<any> {
    return this.http.post(`http://localhost:5000/api/books/${bookId}/wishlist`, { userId }).pipe(
      tap(() => this.refreshBooks().subscribe()),
      catchError(err => {
        console.error('Failed to update wishlist:', err);
        return throwError(() => err);
      })
    );
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>('http://localhost:5000/api/transactions').pipe(
      catchError(err => {
        console.error('Failed to fetch transactions:', err);
        return throwError(() => err);
      })
    );
  }

  deleteBook(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshBooks().subscribe()),
      catchError(err => {
        console.error('Failed to delete book:', err);
        return throwError(() => err);
      })
    );
  }
}