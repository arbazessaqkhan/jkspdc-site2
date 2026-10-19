/**
 * Shared pagination for admin list endpoints.
 *
 * Opt-in: when the request includes ?page or ?pageSize, the endpoint returns
 * an envelope { data, total, page, pageSize, lastPage }. Without those params,
 * endpoints keep returning the full array (public pages / pickers unchanged).
 */
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize?: number;
}

export interface PageEnvelope<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  lastPage: number;
}

/** True when the caller asked for pagination (?page or ?pageSize present). */
export function wantsPagination(q: { page?: number | string; pageSize?: number | string }): boolean {
  return q?.page !== undefined || q?.pageSize !== undefined;
}
function clampInt(v: number | string | undefined, fallback: number, min: number, max: number): number {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : (typeof v === 'number' ? v : NaN);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

/**
 * Run a paged findMany + count. `find` receives the skip/take to apply and
 * must return the (optionally post-processed) page rows.
 */
export async function paginate<T>(
  opts: {
    page?: number;
    pageSize?: number;
    count: () => Promise<number>;
    find: (skip: number, take: number) => Promise<T[]>;
  },
): Promise<PageEnvelope<T>> {
  const page = clampInt(opts.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const pageSize = clampInt(opts.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const total = await opts.count();
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const skip = (page - 1) * pageSize;
  const data = await opts.find(skip, pageSize);
  return { data, total, page, pageSize, lastPage };
}
