import { useMemo } from 'react';
import { useSearchParams as useReactRouterSearchParams, type NavigateOptions } from 'react-router';
import type * as z from 'zod';

export namespace SearchParamsTypes {
	export type Primitive = string | number | boolean;
	export type Value = Primitive | Primitive[] | null | undefined;
	export type Values = Record<string, Value>;
	export type Schema = z.ZodType<Record<string, unknown>>;

	export type UseSearchParamsArgs<TSchema extends Schema> = {
		schema: TSchema;
		fallback: z.output<TSchema>;
	};

	export type SetArgs = {
		key: string;
		value: Value;
		options?: NavigateOptions;
	};

	export type AddArgs = {
		key: string;
		value: Primitive;
		options?: NavigateOptions;
	};

	export type KeyArgs = {
		key: string;
		options?: NavigateOptions;
	};

	export type ReplaceArgs = {
		values: Values;
		options?: NavigateOptions;
	};

	export type UseSearchParamsResult<TSchema extends Schema> = {
		data: z.output<TSchema>;
		isValid: boolean;
		raw: URLSearchParams;
		get: (args: KeyArgs) => string | null;
		getAll: (args: KeyArgs) => string[];
		has: (args: KeyArgs) => boolean;
		set: (args: SetArgs) => void;
		add: (args: AddArgs) => void;
		remove: (args: KeyArgs) => void;
		replace: (args: ReplaceArgs) => void;
		clear: (options?: NavigateOptions) => void;
	};
}

const appendValue = (params: URLSearchParams, key: string, value: SearchParamsTypes.Value): void => {
	if (value === null || value === undefined || value === '') return;
	if (Array.isArray(value)) {
		value.forEach(item => params.append(key, String(item)));
		return;
	}
	params.set(key, String(value));
};

const toRecord = (params: URLSearchParams): Record<string, unknown> => {
	const record: Record<string, unknown> = {};
	params.forEach((value, key) => {
		const existing = record[key];
		if (Array.isArray(existing)) {
			existing.push(value);
			return;
		}
		if (typeof existing === 'string') {
			record[key] = [existing, value];
			return;
		}
		record[key] = value;
	});
	return record;
};

const fromRecord = (values: SearchParamsTypes.Values): URLSearchParams => {
	const params = new URLSearchParams();
	Object.keys(values).forEach(key => appendValue(params, key, values[key]));
	return params;
};

export const useSearchParams = <TSchema extends SearchParamsTypes.Schema>(
	args: SearchParamsTypes.UseSearchParamsArgs<TSchema>
): SearchParamsTypes.UseSearchParamsResult<TSchema> => {
	const nativeSearchParams = useReactRouterSearchParams();
	const searchParams = nativeSearchParams[0];
	const setSearchParams = nativeSearchParams[1];
	const searchKey = searchParams.toString();
	const parsed = useMemo(() => args.schema.safeParse(toRecord(searchParams)), [args.schema, searchKey]);
	const data = parsed.success ? parsed.data : args.fallback;
	const commitSearchParams = (params: URLSearchParams, options?: NavigateOptions): void => {
		setSearchParams(params, options);
	};

	return useMemo(
		() => ({
			data,
			isValid: parsed.success,
			raw: searchParams,
			get: params => searchParams.get(params.key),
			getAll: params => searchParams.getAll(params.key),
			has: params => searchParams.has(params.key),
			set: params => {
				const next = new URLSearchParams(searchParams);
				next.delete(params.key);
				appendValue(next, params.key, params.value);
				commitSearchParams(next, params.options);
			},
			add: params => {
				const next = new URLSearchParams(searchParams);
				next.append(params.key, String(params.value));
				commitSearchParams(next, params.options);
			},
			remove: params => {
				const next = new URLSearchParams(searchParams);
				next.delete(params.key);
				commitSearchParams(next, params.options);
			},
			replace: params => commitSearchParams(fromRecord(params.values), params.options),
			clear: options => commitSearchParams(new URLSearchParams(), options),
		}),
		[data, parsed.success, searchKey]
	);
};
