import type React from 'react';
import { useTranslation } from 'react-i18next';

import type { AppErrorTypes } from '@shared/lib/app-error';

import { Button } from '@/components/ui/button';

type ErrorStateProps = {
	title: string;
	error: AppErrorTypes.AppUiError;
	retryLabel?: string;
	onRetry?: () => void;
	secondaryActionLabel?: string;
	onSecondaryAction?: () => void;
};

export const ErrorState: React.FC<ErrorStateProps> = props => {
	const translation = useTranslation('errors');
	const resolvedRetryLabel = props.retryLabel ?? translation.t('retry');

	return (
		<section className='card space-y-4' role='alert' aria-live='assertive'>
			<h1 className='text-2xl font-semibold tracking-tight'>{props.title}</h1>
			<p className='text-sm text-muted-foreground'>{props.error.message}</p>
			{props.error.requestId ? (
				<p className='text-xs text-muted-foreground'>{translation.t('requestId', { id: props.error.requestId })}</p>
			) : null}
			{props.error.technicalDetails ? (
				<pre className='overflow-auto rounded-md border p-3 text-xs'>{props.error.technicalDetails}</pre>
			) : null}
			<div className='flex flex-wrap gap-2'>
				{props.onRetry && props.error.canRetry ? (
					<Button type='button' onClick={props.onRetry}>
						{resolvedRetryLabel}
					</Button>
				) : null}
				{props.onSecondaryAction && props.secondaryActionLabel ? (
					<Button type='button' variant='outline' onClick={props.onSecondaryAction}>
						{props.secondaryActionLabel}
					</Button>
				) : null}
			</div>
		</section>
	);
};
