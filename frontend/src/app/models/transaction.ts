export interface Transaction {
    _id?: string;
    bookId: number;
    bookTitle: string;
    studentId: string;
    studentName: string;
    type: 'ISSUE' | 'RETURN' | 'EXTEND';
    dueDate?: string;
    date: string;
    createdAt?: string;
}
