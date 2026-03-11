export interface Book {
  _id?: string;
  id: number;
  title: string;
  author: string;
  category: string;
  available: boolean;
  borrowerId?: string;
  borrowerName?: string;
}