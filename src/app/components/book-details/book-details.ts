import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgClass, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { BookService } from '../../services/book';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [NgIf, NgClass, TitleCasePipe, UpperCasePipe, RouterLink],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css']
})
export class BookDetails implements OnInit {
  book: Book | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) { }

  ngOnInit() {
    this.loadBook();
  }

  loadBook() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.book = this.bookService.getBookById(id);
  }

  toggleStatus() {
    if (this.book) {
      this.bookService.updateBookStatus(this.book.id);
    }
  }

  deleteBook() {
    if (this.book && confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(this.book.id);
      this.router.navigate(['/books']);
    }
  }
}