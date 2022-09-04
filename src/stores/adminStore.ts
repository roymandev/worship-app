import { User } from 'firebase/auth';
import { atom } from 'jotai';

export const atomCurrentUser = atom<User | null>(null);
