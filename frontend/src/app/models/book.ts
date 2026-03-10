export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  available: boolean;
  borrowerId?: string;
  borrowerName?: string;
}