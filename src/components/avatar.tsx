"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/actions/authActions";
import type { User } from "lucia";
import { ChevronDown, CircleUser, LogOut } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { useMedia } from "react-use";

type AvatarProps = {
	user: User | null;
}

const Avatar = ({ user }: AvatarProps) => {
	const { isPending, execute } = useServerAction(logoutAction);
	const t = useTranslations('Auth');
	const isMobile = useMedia('(max-width: 768px)', false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="flex justify-center items-center cursor-pointer">
						<Button variant="outline" size="icon" className="w-14 h-14 rounded-full bg-gray-800 dark:bg-gray-600 text-white border-gray-300 dark:border-gray-600">
							<CircleUser className="h-[2rem] w-[2rem]" />
							<span className="sr-only">Toggle user menu</span>
						</Button>
						{!isMobile && (
							<>
								<p className="text-gray-900 dark:text-white text-lg font-bold ml-4 max-w-40 truncate">
									{user ? user.fullName : "My Account"}
								</p>
								<ChevronDown className="size-4 ml-1 mt-1 text-gray-900 dark:text-white font-bold" />
							</>
						)}
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel className="text-lg max-w-48 truncate"> {user ? user.fullName : t("myAccount")} </DropdownMenuLabel>
					<DropdownMenuSeparator />
					{user ? (
						<>
							{" "}
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-md">
								<Button
									disabled={isPending}
									variant="link"
									onClick={async () => {
										const [_, error] = await execute();

										if (error) {
											toast.error(error.message)
										}
									}}
								>
									{t("logout")} <LogOut className="size-4 ml-2" />
								</Button>
							</DropdownMenuItem>
						</>
					) : (
						<DropdownMenuItem className="text-md">
							<Link href="/login"> {t("login")} </Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export default Avatar;
