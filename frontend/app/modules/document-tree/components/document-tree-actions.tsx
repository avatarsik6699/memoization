import { FolderPlus, Plus } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

type Props = {
	onCreate: (type: 'page' | 'folder', parentId: string | null) => void;
};

export const DocumentTreeActions: React.FC<Props> = props => {
	const translation = useTranslation('editor');

	return (
		<div className='document-tree-actions'>
			<Button type='button' size='sm' variant='ghost' onClick={() => props.onCreate('page', null)}>
				<Plus /> {translation.t('tree.newPage')}
			</Button>
			<Button
				type='button'
				size='icon-sm'
				variant='ghost'
				title={translation.t('tree.newFolder')}
				onClick={() => props.onCreate('folder', null)}
			>
				<FolderPlus />
			</Button>
		</div>
	);
};
