import type { TFunction } from 'i18next';
import { X } from 'lucide-react';
import type React from 'react';

import { Button } from '@/components/ui/button';

type Props = {
	children: React.ReactNode;
	onClose: () => void;
	t: TFunction<'editor'>;
};

export const MobileDocumentDrawer: React.FC<Props> = props => (
	<div className='mobile-drawer' role='dialog' aria-modal='true'>
		<div className='mobile-drawer-head'>
			<strong>{props.t('workspace.documents')}</strong>
			<Button
				type='button'
				size='icon-sm'
				variant='ghost'
				aria-label={props.t('workspace.closeDocuments')}
				onClick={props.onClose}
			>
				<X />
			</Button>
		</div>
		{props.children}
	</div>
);
