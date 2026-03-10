export interface Transaction {
    _id?: string;
    bookId: number;
    bookTitle: string;
    studentId: string;
    studentName: string;
    type: 'ISSUE' | 'RETURN';
    date: string;
    createdAt?: string;
}
