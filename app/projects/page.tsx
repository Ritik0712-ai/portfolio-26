import ProjectsList from './ProjectsList';
import { getProjects } from '@/lib/public-data';

// Rendered on the server so the project list is in the initial HTML;
// regenerated at most once a minute.
export const revalidate = 60;

export default async function ProjectsPage() {
  return <ProjectsList projects={await getProjects()} />;
}
