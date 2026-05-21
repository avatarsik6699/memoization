import { useMemo } from 'react';
import {
	useLocation,
	useNavigate,
	useNavigationType,
	useParams,
	type Location,
	type NavigateOptions,
	type NavigationType,
	type To,
} from 'react-router';

export namespace RouterTypes {
	export type RouteParams = {
		nodeId?: string;
	};

	export type RouteId = 'root' | 'node';

	export type NodeRouteArgs = {
		nodeId: string;
	};

	export type NavigateArgs = {
		to: To;
		options?: NavigateOptions;
	};

	export type DeltaArgs = {
		delta: number;
	};

	export type RouteBuilders = {
		root: () => '/';
		node: (args: NodeRouteArgs) => `/${string}`;
	};

	export type UseRouterResult = {
		location: Location;
		navigationType: NavigationType;
		params: RouteParams;
		routes: RouteBuilders;
		push: (args: NavigateArgs) => void;
		replace: (args: NavigateArgs) => void;
		go: (args: DeltaArgs) => void;
		back: () => void;
		forward: () => void;
		isRoute: (routeId: RouteId) => boolean;
	};
}

const routeBuilders: RouterTypes.RouteBuilders = {
	root: () => '/',
	node: args => `/${encodeURIComponent(args.nodeId)}`,
};

export const useRouter = (): RouterTypes.UseRouterResult => {
	const params = useParams<RouterTypes.RouteParams>();
	const navigate = useNavigate();
	const location = useLocation();
	const navigationType = useNavigationType();

	return useMemo(
		() => ({
			location,
			navigationType,
			params,
			routes: routeBuilders,
			push: args => navigate(args.to, args.options),
			replace: args => navigate(args.to, { ...args.options, replace: true }),
			go: args => navigate(args.delta),
			back: () => navigate(-1),
			forward: () => navigate(1),
			isRoute: routeId => {
				if (routeId === 'root') return location.pathname === '/';
				if (routeId === 'node') return Boolean(params.nodeId);
				return false;
			},
		}),
		[location, navigate, navigationType, params.nodeId]
	);
};
