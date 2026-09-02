import { useCurrentUser } from "../profile/useCurrentUser";

export function useHasRole(role: string): boolean {
  const me = useCurrentUser();
  return me.data?.data?.roles?.includes(role) ?? false;
}
