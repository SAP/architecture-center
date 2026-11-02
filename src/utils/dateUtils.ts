// Shared date utilities for determining recently updated content

// Number of months to consider content as "recently updated"
export const RECENT_MONTHS = 3;

// Label for the recent filter in UI components
export const RECENT_FILTER_LABEL = `Last ${RECENT_MONTHS} Months`;

// Calculates the cutoff date for "recently updated" content
export function getRecentCutoffDate(): Date {
    const now = new Date();
    const year = now.getUTCFullYear();
    const targetMonth = now.getUTCMonth() - RECENT_MONTHS;
    const day = now.getUTCDate();
    const lastDayOfTargetMonth = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, targetMonth, Math.min(day, lastDayOfTargetMonth)));
}

// Checks if a given date is within the recent period
export function isDateRecent(date: string | Date | null | undefined): boolean {
    if (!date) return false;

    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(parsedDate.getTime())) return false;

    return parsedDate >= getRecentCutoffDate();
}
