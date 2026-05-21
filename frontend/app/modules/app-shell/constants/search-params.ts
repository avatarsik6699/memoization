import * as z from 'zod';

export const workspaceSearchParamsSchema = z.object({
	q: z.string().trim().default(''),
});

export const defaultWorkspaceSearchParams: z.output<typeof workspaceSearchParamsSchema> = {
	q: '',
};
