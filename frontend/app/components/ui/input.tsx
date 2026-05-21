import * as React from 'react';

import { cn } from '@/lib/utils';

const Input: React.FC<React.ComponentProps<'input'>> = props => {
	const componentProps = { ...props };
	delete componentProps.className;
	delete componentProps.type;

	return (
		<input
			type={props.type}
			data-slot='input'
			className={cn(
				'h-9 w-full min-w-0 rounded-none border border-input bg-transparent px-3 py-1 font-sans text-[12.5px] font-light transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-dim focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
				props.className
			)}
			{...componentProps}
		/>
	);
};

export { Input };
