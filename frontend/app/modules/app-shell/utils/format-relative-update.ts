import type { TFunction } from 'i18next';

import { appDate } from '@/shared/lib/date';

export const formatRelativeUpdate = (value: string | undefined, t: TFunction<'editor'>): string => {
	const diffMinutes = appDate.diffMinutesFromNow(value);
	if (diffMinutes === null) return '';

	if (diffMinutes < 1) return t('time.updatedNow');
	if (diffMinutes < 60) return t('time.updatedMinutes', { count: diffMinutes });

	const diffHours = Math.round(diffMinutes / 60);
	if (diffHours < 24) return t('time.updatedHours', { count: diffHours });

	return t('time.updatedDays', { count: Math.round(diffHours / 24) });
};
