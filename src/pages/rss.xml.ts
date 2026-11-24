import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../posts';
import { SITE } from '../site';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${SITE.name} · Writing`,
    description: 'Notes on building AI agents for engineering teams, APIs and technical leadership.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/writing/${post.id}/`,
    })),
  });
}
