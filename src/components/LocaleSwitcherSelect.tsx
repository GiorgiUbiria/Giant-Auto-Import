'use client';

import { CheckIcon, LanguagesIcon } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import { useTransition } from 'react';
import { Locale } from '../config';
import { setUserLocale } from '../lib/locale';

type Props = {
	defaultValue: string;
	items: Array<{ value: string; label: string }>;
	label: string;
};

export default function LocaleSwitcherSelect({
	defaultValue,
	items,
	label
}: Props) {
	const [isPending, startTransition] = useTransition();

	function onChange(value: string) {
		const locale = value as Locale;
		startTransition(() => {
			setUserLocale(locale);
		});
	}

	return (
		<div className="relative">
			<Select.Root defaultValue={defaultValue} onValueChange={onChange}>
				<Select.Trigger
					aria-label={label}
					className={clsx(
						'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/90 transition-all hover:bg-white/10 hover:text-white',
						isPending && 'pointer-events-none opacity-60'
					)}
				>
					<LanguagesIcon className="h-4 w-4" />
					<span className="hidden sm:inline">{items.find(item => item.value === defaultValue)?.label}</span>
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						align="end"
						className="min-w-[8rem] overflow-hidden rounded-md bg-black/95 backdrop-blur-sm shadow-lg border border-white/10 z-50"
						position="popper"
					>
						<Select.Viewport className="p-1">
							{items.map((item) => (
								<Select.Item
									key={item.value}
									className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-white outline-none hover:bg-white/10 focus:bg-white/10"
									value={item.value}
								>
									<div className="w-4 flex-shrink-0">
										{item.value === defaultValue && (
											<CheckIcon className="h-4 w-4 text-yellow-400" />
										)}
									</div>
									<span>{item.label}</span>
								</Select.Item>
							))}
						</Select.Viewport>
					</Select.Content>
				</Select.Portal>
			</Select.Root>
		</div>
	);
}
