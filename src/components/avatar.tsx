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
import type { AuthenticatedUser } from "@/lib/auth";
import { ChevronDown, CircleUser, LogOut } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { useMedia } from "react-use";

type AvatarProps = {
	user: AuthenticatedUser | null;
}

const Avatar = ({ user }: AvatarProps) => {
	const { isPending, execute } = useServerAction(logoutAction);
	const t = useTranslations('Auth');
	const isMobile = useMedia('(max-width: 768px)', false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						size="sm"
						className="bg-orange-500 hover:bg-orange-600 text-white border-0 font-medium px-4 py-2 gap-2"
					>
						<CircleUser className="w-4 h-4" />
						{user ? user.fullName : "My Account"}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
					{user ? (
						<DropdownMenuItem className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
							<Button
								disabled={isPending}
								variant="ghost"
								size="sm"
								className="w-full justify-start h-auto p-0 text-inherit hover:bg-transparent"
								onClick={async () => {
									const [_, error] = await execute();

									if (error) {
										toast.error(error.message)
									}
								}}
							>
								<LogOut className="w-4 h-4 mr-2" />
								{t("logout")}
							</Button>
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
							<Link href="/login" className="flex items-center w-full">
								<CircleUser className="w-4 h-4 mr-2" />
								{t("login")}
							</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export default Avatar;
