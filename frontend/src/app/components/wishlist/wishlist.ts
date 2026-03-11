import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book';
import { AuthService } from '../../services/auth';
import { Book } from '../../models/book';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class WishlistComponent implements OnInit {
  auth = inject(AuthService);
  private bookService = inject(BookService);

  // Computed signal to filter books down to just the user's wishlist
  wishlistBooks = computed(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    
    return this.bookService.getBooks().filter(book => 
      book.wishlist?.includes(userId)
    );
  });

  ngOnInit() {
    this.bookService.refreshBooks().subscribe();
  }

  removeFromWishlist(book: Book) {
    const userId = this.auth.currentUser()?.id;
    if (userId && (book.id || book._id)) {
      this.bookService.toggleWishlist(book._id || book.id!, userId).subscribe();
    }
  }
}
