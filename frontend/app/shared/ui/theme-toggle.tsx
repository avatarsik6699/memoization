import { useTheme } from 'next-themes';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

const themes = ['light', 'dark', 'system'] as const;

export const ThemeToggle: React.FC = () => {
	const themeController = useTheme();
	const translation = useTranslation('common');

	return (
		<div className='flex items-center gap-2'>
			<span className='text-xs text-muted-foreground'>{translation.t('theme')}</span>
			<div className='inline-flex rounded-lg border border-border bg-background p-1'>
				{themes.map(value => (
					<Button
						key={value}
						type='button'
						size='xs'
						variant={themeController.theme === value ? 'default' : 'ghost'}
						onClick={() => themeController.setTheme(value)}
						className='capitalize'
					>
						{translation.t(value)}
					</Button>
				))}
			</div>
		</div>
	);
};
