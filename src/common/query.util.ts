import { Prisma } from '@prisma/client';

type QueryParams = {
  q?: string; // free text search
  filter?: string; // JSON string or key1:value1,key2:value2
  sort?: string; // e.g. createdAt:desc,name:asc
  page?: string | number;
  pageSize?: string | number;
};

/**
 * buildPrismaQuery
 * - simple parser for common "filter", "q", "sort", pagination
 * - returns { where, orderBy, skip, take }
 */
export function buildPrismaQuery(
  params: QueryParams,
  searchableFields: string[] = [],
) {
  const where: any = {};
  const orderBy: any[] = [];
  let skip: number | undefined;
  let take: number | undefined;

  // pagination
  const page = params.page ? Number(params.page) : 1;
  const pageSize = params.pageSize ? Number(params.pageSize) : 20;
  if (page && pageSize) {
    skip = (page - 1) * pageSize;
    take = pageSize;
  }

  // filters: accept either JSON string or key:val,key2:val2
  if (params.filter) {
    let parsed = {};
    try {
      parsed = JSON.parse(params.filter as string);
    } catch {
      // parse key:val,key2:val2
      const parts = (params.filter as string).split(',');
      for (const part of parts) {
        const [k, ...rest] = part.split(':');
        if (!k) continue;
        const v = rest.join(':');
        parsed[k] = isNaN(Number(v)) ? v : Number(v);
      }
    }
    // merge simple equality filters
    Object.assign(where, parsed);
  }

  // full-text-ish search over provided searchableFields
  if (params.q && searchableFields.length) {
    const q = params.q;
    where.OR = searchableFields.map((f) => ({
      [f]: { contains: q, mode: 'insensitive' },
    }));
  }

  // sorting: 'createdAt:desc,name:asc'
  if (params.sort) {
    const parts = (params.sort as string).split(',');
    for (const part of parts) {
      const [field, dir] = part.split(':');
      if (!field) continue;
      const d = dir && dir.toLowerCase() === 'desc' ? 'desc' : 'asc';
      orderBy.push({ [field]: d } as any);
    }
  } else {
    // default fallback: createdAt desc if exists
    orderBy.push({ createdAt: 'desc' } as any);
  }

  return { where, orderBy, skip, take };
}
