const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Book = require('./models/Book');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/libtracker';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, username, password, role } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const user = new User({ name, username, password, role });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// --- User Management ---

app.get('/api/users/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' }).select('name username _id');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// --- Transactions & Smart Issue/Return ---

app.post('/api/transactions/issue', async (req, res) => {
    try {
        const { bookId, studentId } = req.body;

        const bookIdNum = Number(bookId);
        const book = await Book.findOne({
            $or: [
                { id: isNaN(bookIdNum) ? -1 : bookIdNum },
                ...(mongoose.Types.ObjectId.isValid(bookId) ? [{ _id: bookId }] : [])
            ]
        });
        const student = await User.findById(studentId);

        if (!book || !student) {
            return res.status(404).json({ error: 'Book or Student not found' });
        }

        if (!book.available) {
            return res.status(400).json({ error: 'Book is already checked out' });
        }

        // Update book status
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // 7 days from now

        book.available = false;
        book.borrowerId = student._id;
        book.borrowerName = student.name;
        book.dueDate = dueDate;
        await book.save();

        // Create transaction log
        const transaction = new Transaction({
            bookId: book.id,
            bookTitle: book.title,
            studentId: student._id,
            studentName: student.name,
            type: 'ISSUE',
            dueDate: dueDate
        });
        await transaction.save();

        res.json({ message: 'Book issued successfully', book });
    } catch (err) {
        res.status(500).json({ error: 'Failed to issue book' });
    }
});

app.post('/api/transactions/return', async (req, res) => {
    try {
        const { bookId, userId, role } = req.body;

        const bookIdNum = Number(bookId);
        const book = await Book.findOne({
            $or: [
                { id: isNaN(bookIdNum) ? -1 : bookIdNum },
                ...(mongoose.Types.ObjectId.isValid(bookId) ? [{ _id: bookId }] : [])
            ]
        });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (book.available) {
            return res.status(400).json({ error: 'Book is already in the library' });
        }

        if (role !== 'Librarian' && String(book.borrowerId) !== String(userId)) {
            return res.status(403).json({ error: 'You can only return books you have borrowed' });
        }

        const studentId = book.borrowerId;
        const studentName = book.borrowerName;

        // Update book status
        book.available = true;
        book.borrowerId = null;
        book.borrowerName = null;
        book.dueDate = null;
        await book.save();

        // Create transaction log
        const transaction = new Transaction({
            bookId: book.id,
            bookTitle: book.title,
            studentId: studentId,
            studentName: studentName,
            type: 'RETURN'
        });
        await transaction.save();

        res.json({ message: 'Book returned successfully', book });
    } catch (err) {
        res.status(500).json({ error: 'Failed to return book' });
    }
});

app.post('/api/transactions/extend', async (req, res) => {
    try {
        const { bookId, userId, newDueDate } = req.body;

        const bookIdNum = Number(bookId);
        const book = await Book.findOne({
            $or: [
                { id: isNaN(bookIdNum) ? -1 : bookIdNum },
                ...(mongoose.Types.ObjectId.isValid(bookId) ? [{ _id: bookId }] : [])
            ]
        });

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (book.available) {
            return res.status(400).json({ error: 'Book is not currently borrowed' });
        }

        if (String(book.borrowerId) !== String(userId)) {
            return res.status(403).json({ error: 'You can only extend books you have borrowed' });
        }

        let finalDueDate;
        if (newDueDate) {
            finalDueDate = new Date(newDueDate);
        } else {
            // Extend due date by 7 days from the *current* due date
            finalDueDate = new Date(book.dueDate || new Date());
            finalDueDate.setDate(finalDueDate.getDate() + 7);
        }

        book.dueDate = finalDueDate;
        await book.save();

        // Create transaction log
        const transaction = new Transaction({
            bookId: book.id,
            bookTitle: book.title,
            studentId: userId,
            studentName: book.borrowerName,
            type: 'EXTEND',
            dueDate: finalDueDate
        });
        await transaction.save();

        res.json({ message: 'Book extended successfully', book });
    } catch (err) {
        console.error('Extension Error:', err);
        res.status(500).json({ error: 'Failed to extend book due date' });
    }
});

app.post('/api/books/:id/wishlist', async (req, res) => {
    try {
        const { userId } = req.body;
        const id = req.params.id;
        const idNum = Number(id);

        const book = await Book.findOne({
            $or: [
                { id: isNaN(idNum) ? -1 : idNum },
                ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
            ]
        });

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (String(book.borrowerId) === String(userId)) {
            return res.status(400).json({ error: 'You are already borrowing this book' });
        }

        const wishlist = book.wishlist || [];
        const index = wishlist.findIndex(id => String(id) === String(userId));

        let message = '';
        if (index > -1) {
            wishlist.splice(index, 1);
            message = 'Removed from wishlist';
        } else {
            wishlist.push(userId);
            message = 'Added to wishlist';
        }

        book.wishlist = wishlist;
        await book.save();

        res.json({ message, book });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update wishlist' });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const { studentId } = req.query;
        const filter = studentId ? { studentId } : {};
        const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const user = await User.findOne({ username, role });
        if (!user) {
            return res.status(401).json({ error: 'User not found or role mismatch' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.json({
            id: user._id,
            name: user.name,
            role: user.role,
            username: user.username
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Books CRUD ---

app.get('/api/books/overdue', async (req, res) => {
    try {
        const now = new Date();
        const overdueBooks = await Book.find({
            available: false,
            dueDate: { $lte: now }
        });
        res.json(overdueBooks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch overdue books' });
    }
});

app.get('/api/books', async (req, res) => {
    try {
        const { search, category, availability } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            filter.category = { $regex: `^${category}$`, $options: 'i' };
        }
        if (availability === 'available') {
            filter.available = true;
        } else if (availability === 'checkedout') {
            filter.available = false;
        }

        const books = await Book.find(filter);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

app.post('/api/books', async (req, res) => {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const idNum = Number(id);

        const book = await Book.findOne({
            $or: [
                { id: isNaN(idNum) ? -1 : idNum },
                ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
            ]
        });
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

app.put('/api/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const idNum = Number(id);

        const book = await Book.findOneAndUpdate(
            {
                $or: [
                    { id: isNaN(idNum) ? -1 : idNum },
                    ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
                ]
            },
            req.body,
            { new: true }
        );
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update book' });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const idNum = Number(id);

        await Book.findOneAndDelete({
            $or: [
                { id: isNaN(idNum) ? -1 : idNum },
                ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
            ]
        });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
