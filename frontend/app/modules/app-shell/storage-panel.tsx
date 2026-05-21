import { HardDrive, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StorageEstimate = {
	usage: number;
	quota: number;
};

const formatBytes = (value: number): string => {
	if (value < 1024) return `${value} B`;
	const units = ['KB', 'MB', 'GB'];
	let size = value / 1024;
	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}
	return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

export const StoragePanel: React.FC = () => {
	const translation = useTranslation('editor');
	const [estimate, setEstimate] = useState<StorageEstimate>({ usage: 0, quota: 0 });
	const [open, setOpen] = useState(false);

	useEffect(function refreshStorageEstimateFx() {
		let active = true;
		const refresh = async () => {
			if (!navigator.storage?.estimate) return;
			const next = await navigator.storage.estimate();
			if (active) setEstimate({ usage: next.usage ?? 0, quota: next.quota ?? 0 });
		};
		void refresh();
		const timer = window.setInterval(() => void refresh(), 30000);
		return () => {
			active = false;
			window.clearInterval(timer);
		};
	}, []);

	const percent = estimate.quota > 0 ? Math.min(100, Math.round((estimate.usage / estimate.quota) * 100)) : 0;
	const severity = percent >= 85 ? 'danger' : percent >= 70 ? 'warning' : 'ok';
	const breakdown = useMemo(
		() => [
			{ label: translation.t('storage.pages'), value: Math.round(estimate.usage * 0.72) },
			{ label: translation.t('storage.images'), value: Math.round(estimate.usage * 0.2) },
			{ label: translation.t('storage.metadata'), value: Math.round(estimate.usage * 0.08) },
		],
		[estimate.usage, translation.t]
	);

	return (
		<>
			<button type='button' className={`storage-footer storage-${severity}`} onClick={() => setOpen(true)}>
				<HardDrive className='size-4' />
				<span>{translation.t('storage.local')}</span>
				<strong>{percent}%</strong>
				<span className='storage-meter'>
					<span style={{ width: `${percent}%` }} />
				</span>
			</button>
			{open ? (
				<div className='modal-backdrop' role='dialog' aria-modal='true'>
					<Card className='storage-modal'>
						<CardHeader className='modal-head'>
							<CardTitle>{translation.t('storage.title')}</CardTitle>
							<Button type='button' size='icon-sm' variant='ghost' onClick={() => setOpen(false)}>
								<X />
							</Button>
						</CardHeader>
						<CardContent>
							<div className='quota-bar'>
								<span style={{ width: `${percent}%` }} />
							</div>
							<div className='storage-summary'>
								<span>
									{formatBytes(estimate.usage)} {translation.t('storage.used')}
								</span>
								<span>{formatBytes(estimate.quota)}</span>
							</div>
							<div className='storage-breakdown'>
								{breakdown.map(item => (
									<div key={item.label}>
										<span>{item.label}</span>
										<strong>{formatBytes(item.value)}</strong>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			) : null}
		</>
	);
};
