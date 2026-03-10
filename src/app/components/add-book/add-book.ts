import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book';
import { Book } from '../../models/book';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './add-book.html',
  styleUrls: ['./add-book.css']
})
export class AddBook implements OnInit {
  isEditMode = false;
  bookId: number | null = null;

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
      this.bookId = Number(idParam);
      const existingBook = this.bookService.getBookById(this.bookId);
      if (existingBook) {
        this.book = { ...existingBook };
      } else {
        this.router.navigate(['/books']);
      }
    }
  }

  saveBook() {
    if (this.isEditMode) {
      this.bookService.deleteBook(this.bookId!); // Simplified: delete and re-add or add update method
      this.bookService.addBook(this.book);
      alert('Book updated successfully');
    } else {
      this.book.id = Date.now();
      this.bookService.addBook(this.book);
      alert('Book added successfully');
    }
    this.router.navigate(['/books']);
  }
}