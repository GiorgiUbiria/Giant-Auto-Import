"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CircleUser } from "lucide-react";
import { ActionResult, Form } from "@/lib/form";
import type { User } from "lucia";
import Link from "next/link";

interface AvatarProps {
  user: User | null;
  logout: () => Promise<ActionResult>;
}

const Avatar: React.FC<AvatarProps> = ({ user, logout }) => {
  const userMenuItem = user ? (
    <DropdownMenuItem asChild>
      <Link href={user.role_id === 1 ? "/dashboard" : "/admin"}>
        {user.role_id === 1 ? "Personal Cabinet" : "Admin Panel"}
      </Link>
    </DropdownMenuItem>
  ) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <CircleUser className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userMenuItem}
        {user ? (
          <>
            {" "}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Form action={logout}>
                <button>Sign out</button>
              </Form>
            </DropdownMenuItem>
            {user.role_id === 2 && (
            <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <Link href="/signup">Register new user</Link>
            </DropdownMenuItem>
            </>
            )}
          </>
        ) : (
          <DropdownMenuItem>
            <Link href="/login"> Sign In </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Avatar;
