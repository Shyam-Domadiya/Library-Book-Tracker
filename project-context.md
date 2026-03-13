# Library Tracker - Project Context

## Overview
Library Tracker is a full-stack library management application. It allows users (Students/Librarians) to manage books, track book borrowing/returns, extend due dates, and maintain a wishlist. 

## Technology Stack
- **Frontend**: Angular (v21.2.0), TypeScript, RxJS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens), bcryptjs for password hashing.
- **Testing**: Vitest (Frontend).
- **Build/Dev Tools**: Angular CLI, Vite, nodemon (Backend), concurrently (Root).

## Architecture & Features
1. **Authentication & Authorization**:
   - Two main roles: `Librarian` and `Student`.
   - Login and Registration functionalities.
   - Guarded routes in Angular to restrict access based on roles.
2. **Book Management (Librarian)**:
   - Add new books, update existing book details, and delete books.
   - View all books and track their availability.
3. **Library Transactions (Students & Librarians)**:
   - Search books by title, author, category, or availability.
   - Issue books (checkout).
   - Return books.
   - Extend book due dates.
   - Keep a wishlist for books currently checked out by others.
   - Track overdue books and transaction history.

## Backend Structure
Located in the `backend/` directory.
- `server.js`: Main entry point containing Express configuration, MongoDB connection, and all API routes (`/api/auth/*`, `/api/users/*`, `/api/books/*`, `/api/transactions/*`).
- `models/`: Mongoose schemas.
  - `Book.js`: Stores book details (title, author, category, availability, borrowerId, dueDate, wishlist).
  - `User.js`: Stores user details and securely hashes passwords using bcrypt pre-save hooks (name, username, password, role).
  - `Transaction.js`: Logs all library activities like ISSUE, RETURN, and EXTEND (bookId, studentId, type, dueDate).

## Frontend Structure
Located in the `frontend/` directory.

### Components (`src/app/components/`)
- `add-book`: Form for the librarian to add new books to the system.
- `book-details`: Detailed view of a specific book.
- `book-list`: Displays the catalog of books with search and filter capabilities.
- `history`: Shows the transaction history logs.
- `home`: The landing/dashboard page of the application.
- `login`: User login interface.
- `modal`: Reusable modal component for popups/confirmations.
- `navbar`: Top navigation bar containing links based on user roles.
- `register`: User registration interface.
- `wishlist`: Displays the user's wishlisted books.

### Services (`src/app/services/`)
- `auth.ts`: Handles authentication API calls (login, register) and manages user session/roles.
- `book.ts`: Handles API calls related to books and transactions (fetching, issuing, returning, extending, wishlisting).
- `modal.ts`: State management for the reusable modal component.

## How to Run Locally
The project is configured to run both the frontend and backend concurrently using a single command from the root directory:

```bash
# Install dependencies for root, frontend, and backend
npm run install:all

# Start both frontend and backend development servers
npm run dev
```

- The frontend will be accessible at `http://localhost:4200/`.
- The backend server will run on port `5000` (`http://localhost:5000/`).
