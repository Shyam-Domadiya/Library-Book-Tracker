import { Component, OnInit, inject } from '@angular/core';
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
  book: Book | undefined;
  students: any[] = [];
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
        this.students = students;
      });
    }
  }

  loadBook() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookService.getBookById(id).subscribe(book => {
      this.book = book;
    });
  }

  onIssueBook() {
    if (this.book && this.selectedStudentId) {
      this.bookService.issueBook(this.book.id, this.selectedStudentId);
      // Update local state for immediate UI feedback
      const student = this.students.find(s => s._id === this.selectedStudentId);
      this.book.available = false;
      this.book.borrowerName = student?.name;
      this.selectedStudentId = '';
    }
  }

  toggleStatus() {
    if (this.book) {
      if (this.book.available) {
        // Just toggling availability if no student is selected (fallback for old logic)
        this.bookService.updateBookStatus(this.book.id);
        this.book.available = !this.book.available;
      } else {
        // Use smart return
        this.bookService.returnBook(this.book.id);
        this.book.available = true;
        this.book.borrowerName = undefined;
      }
    }
  }

  deleteBook() {
    if (this.book && confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(this.book.id);
      this.router.navigate(['/books']);
    }
  }
}