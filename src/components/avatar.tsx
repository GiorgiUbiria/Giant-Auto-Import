"use client";

import Link from "next/link";
import type { User } from "lucia";

import { ActionResult, Form } from "@/lib/form";

import { CircleUser } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AvatarProps {
  user: User | null;
  logout: () => Promise<ActionResult>;
}

const Avatar: React.FC<AvatarProps> = ({ user, logout }) => {
  const userMenuItem = user ? (
    <DropdownMenuItem asChild>
      <Link href={user.role_id === 1 ? "/dashboard" : "/admin"} className="cursor-pointer">
        {user.role_id === 1 ? "Personal Cabinet" : "Admin Panel"}
      </Link>
    </DropdownMenuItem>
  ) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-14 h-14 rounded-full">
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
