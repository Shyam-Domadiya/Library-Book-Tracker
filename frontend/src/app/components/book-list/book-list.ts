import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, NgClass, TitleCasePipe, UpperCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink, TitleCasePipe, UpperCasePipe, DatePipe, FormsModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BookListComponent implements OnInit {
  auth = inject(AuthService);
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedAvailability: string = '';
  categories: string[] = ['Programming', 'Fiction', 'History', 'Science', 'Biography'];
  private searchTimer: any = null;

  constructor(private bookService: BookService) { }

  ngOnInit() {
    this.fetchBooks();
  }

  fetchBooks() {
    this.bookService.refreshBooks({
      search: this.searchTerm,
      category: this.selectedCategory,
      availability: this.selectedAvailability
    }).subscribe();
  }

  onSearchChange() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.fetchBooks(), 300);
  }

  onDropdownChange() {
    this.fetchBooks();
  }

  get filteredBooks(): Book[] {
    return this.bookService.getBooks();
  }

  toggleStatus(book: Book) {
    const currentUser = this.auth.currentUser();
    if (currentUser) {
      if (book.available) {
        if (!this.auth.isLibrarian()) {
          this.bookService.issueBook(book._id || book.id, currentUser.id).subscribe({
            error: (err) => alert('Failed to borrow book: ' + (err.error?.error || err.message))
          });
        } else {
          alert('Please view Book Details to issue a book to a specific student.');
        }
      } else {
        this.bookService.returnBook(book._id || book.id, currentUser.id, currentUser.role).subscribe({
          error: (err) => alert('Failed to return book: ' + (err.error?.error || err.message))
        });
      }
    }
  }

  deleteBook(id: number | string) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        error: (err) => alert('Failed to delete book: ' + (err.error?.error || err.message))
      });
    }
  }

  toggleWishlist(book: Book) {
    const currentUser = this.auth.currentUser();
    if (currentUser) {
      this.bookService.toggleWishlist(book._id || book.id, currentUser.id).subscribe({
        error: (err) => alert('Failed to update wishlist: ' + (err.error?.error || err.message))
      });
    }
  }
}