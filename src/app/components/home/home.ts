import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  totalBooks = 0;
  availableBooks = 0;
  checkedOutBooks = 0;

  constructor(private bookService: BookService) { }

  ngOnInit() {
    const books = this.bookService.getBooks();
    this.totalBooks = books.length;
    this.availableBooks = books.filter(b => b.available).length;
    this.checkedOutBooks = this.totalBooks - this.availableBooks;
  }
}
