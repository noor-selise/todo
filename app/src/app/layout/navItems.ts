import { ListChecks, UserRound } from "lucide-react";

export const navItems = [
  { href: "/", labelKey: "nav.todos", icon: ListChecks },
  { href: "/profile", labelKey: "nav.profile", icon: UserRound }
] as const;
