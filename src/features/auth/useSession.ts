import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PublicUser } from '@/domain/user';
import { queryKeys } from '@/lib/api/queryClient';
import { authApi } from '@/services/authApi';

export interface Session {
  user: PublicUser | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export function useSession(): Session {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.session,
    queryFn: authApi.me,
    staleTime: Infinity,
  });
  const user = data ?? null;
  return { user, isLoading: isPending, isAdmin: user?.role === 'admin' };
}

/** Signing in or out changes what the user may see, so cached personal data is dropped. */
function useSetSessionUser() {
  const queryClient = useQueryClient();
  return (user: PublicUser | null) => {
    queryClient.removeQueries({ queryKey: ['orders'] });
    queryClient.setQueryData(queryKeys.session, user);
  };
}

export function useLogin() {
  const setUser = useSetSessionUser();
  return useMutation({ mutationFn: authApi.login, onSuccess: setUser });
}

export function useRegister() {
  const setUser = useSetSessionUser();
  return useMutation({ mutationFn: authApi.register, onSuccess: setUser });
}

export function useLogout() {
  const setUser = useSetSessionUser();
  return useMutation({ mutationFn: authApi.logout, onSuccess: () => setUser(null) });
}
