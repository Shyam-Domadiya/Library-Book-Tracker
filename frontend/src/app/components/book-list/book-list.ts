import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, NgClass, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink, TitleCasePipe, UpperCasePipe, FormsModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BookListComponent implements OnInit {
  auth = inject(AuthService);
  searchTerm: string = '';
  selectedCategory: string = '';
  categories: string[] = ['Programming', 'Fiction', 'History', 'Science', 'Biography'];

  constructor(private bookService: BookService) { }

  ngOnInit() {
    // Service handles loading initial data via constructor
  }

  get filteredBooks(): Book[] {
    return this.bookService.getBooks().filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === '' || book.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  toggleStatus(id: number) {
    this.bookService.updateBookStatus(id);
  }

  deleteBook(id: number) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id);
    }
  }
}