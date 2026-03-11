import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, TitleCasePipe, UpperCasePipe, RouterLink, FormsModule],
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
    if (currentBook) {
      if (currentBook.available) {
        this.bookService.updateBook(currentBook._id || currentBook.id, { ...currentBook, available: false }).subscribe({
          next: () => this.book.set({ ...currentBook, available: false }),
          error: (err) => alert('Failed to update status: ' + (err.error?.error || err.message))
        });
      } else {
        this.bookService.returnBook(currentBook._id || currentBook.id).subscribe({
          next: () => this.book.set({ ...currentBook, available: true, borrowerName: undefined }),
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
}