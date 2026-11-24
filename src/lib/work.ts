import { getCollection, type CollectionEntry } from 'astro:content';

export type WorkEntry = CollectionEntry<'work'>;

/** Work entries in display order. Drafts show only in `npm run dev`, so nothing unpublished is ever linked. */
export async function getWork(): Promise<WorkEntry[]> {
  const all = await getCollection('work', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export const workHref = (e: WorkEntry) => `/work/${e.id}/`;

/** "Role · When · first few stack items", for rows and cards. */
export const workMeta = (e: WorkEntry, stackItems = 3) =>
  [e.data.role, e.data.period, e.data.stack.slice(0, stackItems).join(', ')].filter(Boolean).join(' · ');
