import * as React from 'react';

import { cn } from '@/lib/utils';

type CardProps = React.ComponentProps<'div'> & { size?: 'default' | 'sm' };
type DivProps = React.ComponentProps<'div'>;

const Card: React.FC<CardProps> = props => {
	const componentProps = { ...props };
	delete componentProps.className;
	delete componentProps.size;

	return (
		<div
			data-slot='card'
			data-size={props.size ?? 'default'}
			className={cn(
				'group/card flex flex-col gap-4 overflow-hidden rounded-none border border-border bg-card py-4 font-sans text-sm font-light text-card-foreground shadow-[0_24px_80px_var(--shadow)] has-data-[slot=card-footer]:pb-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0',
				props.className
			)}
			{...componentProps}
		/>
	);
};

const CardHeader: React.FC<DivProps> = props => {
	const componentProps = { ...props };
	delete componentProps.className;

	return (
		<div
			data-slot='card-header'
			className={cn(
				'group/card-header @container/card-header grid auto-rows-min items-start gap-1 border-b border-border px-5 pb-4 group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:pb-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
				props.className
			)}
			{...componentProps}
		/>
	);
};

const CardTitle: React.FC<DivProps> = props => {
	const componentProps = { ...props };
	delete componentProps.className;

	return (
		<div
			data-slot='card-title'
			className={cn('text-[9px] leading-none font-bold tracking-[0.14em] uppercase', props.className)}
			{...componentProps}
		/>
	);
};

const CardDescription: React.FC<DivProps> = props => {
	const componentProps = { ...props };
	delete componentProps.className;

	return (
		<div
			data-slot='card-description'
			className={cn('text-sm text-muted-foreground', props.className)}
			{...componentProps}
		/>
	);
};

const CardAction: React.FC<DivProps> = props => {
	const componentProps = { ...props };
	delete componentProps.className;

	return (
		<div
			data-slot='card-action'
			className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', props.className)}
			{...componentProps}
		/>
	);
};

const CardContent: React.FC<DivProps> = props => {
	const componentProps = { ...props };
	delete componentProps.className;

	return (
		<div
			data-slot='card-content'
			className={cn('px-5 group-data-[size=sm]/card:px-3', props.className)}
			{...componentProps}
		/>
	);
};

const CardFooter: React.FC<DivProps> = props => {
	const componentProps = { ...props };
	delete componentProps.className;

	return (
		<div
			data-slot='card-footer'
			className={cn(
				'flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3',
				props.className
			)}
			{...componentProps}
		/>
	);
};

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
