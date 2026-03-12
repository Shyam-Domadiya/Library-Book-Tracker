import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book';
import { Book } from '../../models/book';
import { ModalService } from '../../services/modal';

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
    private router: Router,
    private modalService: ModalService
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
          this.modalService.open('Success', 'Book updated successfully', 'success');
          this.router.navigate(['/books']);
        },
        error: (err) => this.modalService.open('Error', 'Failed to update book: ' + (err.error?.error || err.message), 'error')
      });
    } else {
      this.book.id = Date.now();
      this.bookService.addBook(this.book).subscribe({
        next: () => {
          this.modalService.open('Success', 'Book added successfully', 'success');
          this.router.navigate(['/books']);
        },
        error: (err) => this.modalService.open('Error', 'Failed to add book: ' + (err.error?.error || err.message), 'error')
      });
    }
  }
}