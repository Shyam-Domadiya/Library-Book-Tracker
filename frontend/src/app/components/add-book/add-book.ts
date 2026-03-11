import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book';
import { Book } from '../../models/book';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-book.html',
  styleUrls: ['./add-book.css']
})
export class AddBook implements OnInit {
  isEditMode = false;
  bookId: string | null = null;

  book: Book = {
    id: 0,
    title: '',
    author: '',
    category: '',
    available: true
  };

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.bookId = idParam;
      this.bookService.getBookById(this.bookId).subscribe(book => {
        if (book) {
          this.book = { ...book };
        } else {
          this.router.navigate(['/books']);
        }
      });
    }
  }

  saveBook() {
    if (this.isEditMode && this.bookId !== null) {
      this.bookService.updateBook(this.bookId, this.book).subscribe({
        next: () => {
          alert('Book updated successfully');
          this.router.navigate(['/books']);
        },
        error: (err) => alert('Failed to update book: ' + (err.error?.error || err.message))
      });
    } else {
      this.book.id = Date.now();
      this.bookService.addBook(this.book).subscribe({
        next: () => {
          alert('Book added successfully');
          this.router.navigate(['/books']);
        },
        error: (err) => alert('Failed to add book: ' + (err.error?.error || err.message))
      });
    }
  }
}