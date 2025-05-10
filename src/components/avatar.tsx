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
						<Button variant="outline" size="icon" className="w-14 h-14 rounded-full bg-foreground text-white">
							<CircleUser className="h-[2rem] w-[2rem]" />
							<span className="sr-only">Toggle user menu</span>
						</Button>
						{!isMobile && (
							<>
								<p className="text-white text-xl font-bold ml-4">
									My Account
								</p>
								<ChevronDown className="size-4 ml-1 mt-1 text-white font-bold" />
							</>
						)}
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel className="text-lg"> {t("myAccount")} </DropdownMenuLabel>
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
