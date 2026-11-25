import type { LoginInput, PublicUser, RegisterInput } from '@/domain/user';
import { apiRequest } from '@/lib/api/http';

export const authApi = {
  async me(): Promise<PublicUser | null> {
    return (await apiRequest<{ user: PublicUser | null }>('/auth/me')).user;
  },

  async login(input: LoginInput): Promise<PublicUser> {
    return (await apiRequest<{ user: PublicUser }>('/auth/login', { method: 'POST', json: input })).user;
  },

  async register(input: RegisterInput): Promise<PublicUser> {
    return (await apiRequest<{ user: PublicUser }>('/auth/register', { method: 'POST', json: input })).user;
  },

  logout(): Promise<void> {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};
