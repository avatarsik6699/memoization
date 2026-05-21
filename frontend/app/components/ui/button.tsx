import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding font-sans text-[10.5px] font-bold tracking-normal whitespace-nowrap uppercase transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90 [a]:hover:bg-primary/90',
				outline:
					'border-border bg-background text-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				ghost:
					'text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 gap-2 px-4',
				xs: "h-6 gap-1 px-2 text-[9px] [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 gap-1.5 px-3 text-[10.5px] [&_svg:not([class*='size-'])]:size-3.5",
				lg: 'h-10 gap-2 px-5',
				icon: 'size-8',
				'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

type ButtonProps = React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

const Button: React.FC<ButtonProps> = props => {
	const Comp = props.asChild ? Slot.Root : 'button';
	const componentProps = { ...props };
	delete componentProps.asChild;
	delete componentProps.variant;
	delete componentProps.size;
	delete componentProps.className;

	return (
		<Comp
			data-slot='button'
			data-variant={props.variant ?? 'default'}
			data-size={props.size ?? 'default'}
			className={cn(
				buttonVariants({
					variant: props.variant ?? 'default',
					size: props.size ?? 'default',
					className: props.className,
				})
			)}
			{...componentProps}
		/>
	);
};

export { Button, buttonVariants };
