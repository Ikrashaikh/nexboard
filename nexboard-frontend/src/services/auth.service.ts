import api from '../lib/axios';
import type { AuthUser } from '../types';

export const authService = {
  login: (username: string, password: string) =>
    api.post<AuthUser>('/auth/login', { username, password }),
};
