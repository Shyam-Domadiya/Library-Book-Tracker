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

  formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  get todayDateString(): string {
    return this.formatDateForInput(new Date());
  }

  updateDueDate(book: Book, event: any) {
    const newDate = event.target.value;
    const currentUser = this.auth.currentUser();
    
    if (currentUser && book.borrowerId === currentUser.id && newDate) {
      const d = new Date(newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      
      if (d < today) {
        alert("Cannot set due date in the past");
        event.target.value = this.formatDateForInput(book.dueDate);
        return;
      }

      this.bookService.extendBook(book._id || book.id, currentUser.id, newDate).subscribe({
        error: (err) => {
          alert('Failed to update due date: ' + (err.error?.error || err.message));
          event.target.value = this.formatDateForInput(book.dueDate);
        }
      });
    }
  }

  adjustDueDate(book: Book, days: number) {
    const currentUser = this.auth.currentUser();
    if (currentUser && book.borrowerId === currentUser.id && book.dueDate) {
      const d = new Date(book.dueDate);
      d.setDate(d.getDate() + days);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(d);
      checkDate.setHours(0, 0, 0, 0);
      
      if (checkDate < today) {
        alert("Cannot set due date in the past");
        return;
      }

      const newDateStr = d.toISOString();
      this.bookService.extendBook(book._id || book.id, currentUser.id, newDateStr).subscribe({
        error: (err) => alert('Failed to update due date: ' + (err.error?.error || err.message))
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