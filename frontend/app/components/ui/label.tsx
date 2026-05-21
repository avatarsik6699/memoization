import { Label as LabelPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Label: React.FC<React.ComponentProps<typeof LabelPrimitive.Root>> = props => {
	const componentProps = { ...props };
	delete componentProps.className;

	return (
		<LabelPrimitive.Root
			data-slot='label'
			className={cn(
				'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
				props.className
			)}
			{...componentProps}
		/>
	);
};

export { Label };
