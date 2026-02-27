import matter from 'gray-matter';

export interface FrontmatterResult {
  content: string;
  data: Record<string, unknown>;
}

export function parseFrontmatter(raw: string): FrontmatterResult {
  const { content, data } = matter(raw);
  return { content, data };
}
