import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass, TitleCasePipe, UpperCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, TitleCasePipe, UpperCasePipe, RouterLink, FormsModule, DatePipe],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css']
})
export class BookDetails implements OnInit {
  auth = inject(AuthService);

  // Use signals for reactive state — ensures change detection runs after async fetch
  book = signal<Book | null>(null);
  students = signal<any[]>([]);
  selectedStudentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) { }

  ngOnInit() {
    this.loadBook();
    if (this.auth.isLibrarian()) {
      this.bookService.getStudents().subscribe(students => {
        this.students.set(students);
      });
    }
  }

  loadBook() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.bookService.getBookById(id).subscribe({
      next: (book) => this.book.set(book),
      error: () => this.book.set(null)
    });
  }

  onIssueBook() {
    const currentBook = this.book();
    if (currentBook && this.selectedStudentId) {
      this.bookService.issueBook(currentBook._id || currentBook.id, this.selectedStudentId).subscribe({
        next: () => {
          const student = this.students().find(s => s._id === this.selectedStudentId);
          this.book.set({ ...currentBook, available: false, borrowerName: student?.name });
          this.selectedStudentId = '';
        },
        error: (err) => alert('Failed to issue book: ' + (err.error?.error || err.message))
      });
    }
  }

  toggleStatus() {
    const currentBook = this.book();
    const currentUser = this.auth.currentUser();
    if (currentBook && currentUser) {
      if (currentBook.available) {
        if (!this.auth.isLibrarian()) {
          this.bookService.issueBook(currentBook._id || currentBook.id, currentUser.id).subscribe({
            next: () => this.book.set({ ...currentBook, available: false, borrowerName: currentUser.name, borrowerId: currentUser.id }),
            error: (err) => alert('Failed to borrow book: ' + (err.error?.error || err.message))
          });
        } else {
          this.bookService.updateBook(currentBook._id || currentBook.id, { ...currentBook, available: false }).subscribe({
            next: () => this.book.set({ ...currentBook, available: false }),
            error: (err) => alert('Failed to update status: ' + (err.error?.error || err.message))
          });
        }
      } else {
        this.bookService.returnBook(currentBook._id || currentBook.id, currentUser.id, currentUser.role).subscribe({
          next: () => this.book.set({ ...currentBook, available: true, borrowerName: undefined, borrowerId: undefined }),
          error: (err) => alert('Failed to return book: ' + (err.error?.error || err.message))
        });
      }
    }
  }

  deleteBook() {
    const currentBook = this.book();
    if (currentBook && confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(currentBook._id || currentBook.id).subscribe({
        next: () => this.router.navigate(['/books']),
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

  updateDueDate(event: any) {
    const newDate = event.target.value;
    const currentBook = this.book();
    const currentUser = this.auth.currentUser();
    
    if (currentBook && currentUser && currentBook.borrowerId === currentUser.id && newDate) {
      const d = new Date(newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      
      if (d < today) {
        alert("Cannot set due date in the past");
        event.target.value = this.formatDateForInput(currentBook.dueDate);
        return;
      }

      this.bookService.extendBook(currentBook._id || currentBook.id, currentUser.id, newDate).subscribe({
        next: (res) => this.book.set(res.book),
        error: (err) => {
          alert('Failed to update due date: ' + (err.error?.error || err.message));
          event.target.value = this.formatDateForInput(currentBook.dueDate);
        }
      });
    }
  }

  adjustDueDate(days: number) {
    const currentBook = this.book();
    const currentUser = this.auth.currentUser();
    
    if (currentBook && currentUser && currentBook.borrowerId === currentUser.id && currentBook.dueDate) {
      const d = new Date(currentBook.dueDate);
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
      this.bookService.extendBook(currentBook._id || currentBook.id, currentUser.id, newDateStr).subscribe({
        next: (res) => this.book.set(res.book),
        error: (err) => alert('Failed to update due date: ' + (err.error?.error || err.message))
      });
    }
  }

  toggleWishlist() {
    const currentBook = this.book();
    const currentUser = this.auth.currentUser();
    if (currentBook && currentUser) {
      this.bookService.toggleWishlist(currentBook._id || currentBook.id, currentUser.id).subscribe({
        next: (res) => {
           // Update local book state with the new wishlist array
           this.book.set(res.book);
        },
        error: (err) => alert('Failed to update wishlist: ' + (err.error?.error || err.message))
      });
    }
  }
}