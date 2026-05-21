import type React from 'react';

import { OfflineWorkspace } from '@/modules/app-shell/offline-workspace';

export function meta() {
	return [{ title: 'memoization' }, { name: 'description', content: 'Offline-first local document editor.' }];
}

const IndexRoute: React.FC = () => <OfflineWorkspace />;

export default IndexRoute;
