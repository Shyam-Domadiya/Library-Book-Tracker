export type Role = 'Librarian' | 'Student';

export interface User {
    id: string;
    name: string;
    role: Role;
    username: string;
}
