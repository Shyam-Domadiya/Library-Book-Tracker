const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    bookId: { type: Number, required: true },
    bookTitle: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    type: { type: String, enum: ['ISSUE', 'RETURN'], required: true },
    dueDate: { type: Date },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
