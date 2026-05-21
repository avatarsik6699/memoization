import { index, route } from '@react-router/dev/routes';

export default [index('./routes/_index.tsx'), route(':nodeId', './routes/$nodeId.tsx')];
