const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, default: true },
    id: { type: Number, unique: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    borrowerName: { type: String, default: null },
    dueDate: { type: Date, default: null },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true, id: false });

module.exports = mongoose.model('Book', bookSchema);
