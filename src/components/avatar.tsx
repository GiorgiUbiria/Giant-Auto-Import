"use client";

import Link from "next/link";
import type { User } from "lucia";

import { ChevronDown, CircleUser } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useServerAction } from "zsa-react";
import { logoutAction } from "@/lib/actions/authActions";
import { toast } from "sonner";

type AvatarProps = {
	user: User | null;
}

const Avatar = ({ user }: AvatarProps) => {
	const { isPending, execute } = useServerAction(logoutAction);

	const userMenuItem = user ? (
		<DropdownMenuItem asChild className="text-md">
			<Link href={user.role === "CUSTOMER" ? "/dashboard" : "/admin"} className="cursor-pointer">
				{user.role === "CUSTOMER" ? "Personal Cabinet" : "Admin Panel"}
			</Link>
		</DropdownMenuItem>
	) : null;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="flex justify-center items-center cursor-pointer">
						<Button variant="outline" size="icon" className="w-14 h-14 rounded-full bg-foreground text-white">
							<CircleUser className="h-[2rem] w-[2rem]" />
							<span className="sr-only">Toggle user menu</span>
						</Button>
						<p className="text-white text-xl font-bold ml-4"> {user?.role === "CUSTOMER" ? user?.fullName : user?.role}</p>
						<ChevronDown className="size-4 ml-1 mt-1 text-white font-bold" />
					</div>
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
								<Button
									disabled={isPending}
									variant="ghost"
									onClick={async () => {
										const [_, error] = await execute();

										if (error) {
											toast.error(error.message)
										}
									}}
								>
									Sign out
								</Button>
							</DropdownMenuItem>
						</>
					) : (
						<DropdownMenuItem className="text-md">
							<Link href="/login"> Sign In </Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export default Avatar;
