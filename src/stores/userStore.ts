import { User } from 'firebase/auth';
import { atom } from 'jotai';

export const atomUser = atom<User | null>(null);
