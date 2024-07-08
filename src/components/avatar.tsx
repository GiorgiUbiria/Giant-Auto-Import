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
    <DropdownMenuItem asChild className="text-md">
      <Link href={user.role_id === 1 ? "/dashboard" : "/admin"} className="cursor-pointer">
        {user.role_id === 1 ? "Personal Cabinet" : "Admin Panel"}
      </Link>
    </DropdownMenuItem>
  ) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-14 h-14 rounded-full bg-foreground text-white">
          <CircleUser className="h-[2rem] w-[2rem]" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-lg">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userMenuItem}
        {user ? (
          <>
            {" "}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-md">
              <Form action={logout}>
                <button>Sign out</button>
              </Form>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem className="text-md">
            <Link href="/login"> Sign In </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Avatar;
