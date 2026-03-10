import { Injectable } from '@angular/core';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private STORAGE_KEY = 'lib_tracker_books';

  private books: Book[] = [
    { id: 1, title: 'Angular Basics', author: 'John Smith', category: 'Programming', available: true },
    { id: 2, title: 'TypeScript Guide', author: 'David Brown', category: 'Programming', available: false }
  ];

  constructor() {
    this.loadFromStorage();
  }

  getBooks(): Book[] {
    return this.books;
  }

  getBookById(id: number) {
    return this.books.find(book => book.id === id);
  }

  addBook(book: Book) {
    this.books.push(book);
    this.saveToStorage();
  }

  updateBookStatus(id: number) {
    const book = this.books.find(b => b.id === id);
    if (book) {
      book.available = !book.available;
      this.saveToStorage();
    }
  }

  deleteBook(id: number) {
    this.books = this.books.filter(b => b.id !== id);
    this.saveToStorage();
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.books));
  }

  private loadFromStorage() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.books = JSON.parse(data);
    }
  }
}