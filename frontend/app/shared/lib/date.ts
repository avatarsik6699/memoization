export namespace AppDateTypes {
	export type IsoString = string;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const nowMs = (): number => Date.now();

const nowIso = (): AppDateTypes.IsoString => new Date().toISOString();

const parseMs = (value: string | undefined): number | null => {
	if (!value) return null;

	const timestamp = new Date(value).getTime();
	return Number.isNaN(timestamp) ? null : timestamp;
};

const diffMinutesFromNow = (value: string | undefined): number | null => {
	const timestamp = parseMs(value);
	if (timestamp === null) return null;

	return Math.max(0, Math.round((nowMs() - timestamp) / MINUTE_MS));
};

export const appDate = {
	DAY_MS,
	HOUR_MS,
	MINUTE_MS,
	diffMinutesFromNow,
	nowIso,
	nowMs,
	parseMs,
} as const;
