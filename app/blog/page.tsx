import BlogList from './BlogList';
import { getBlogs } from '@/lib/public-data';

// Rendered on the server so the post list is in the initial HTML;
// regenerated at most once a minute.
export const revalidate = 60;

export default async function BlogPage() {
  return <BlogList posts={await getBlogs()} />;
}
