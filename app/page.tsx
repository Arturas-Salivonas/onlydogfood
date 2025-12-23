import { HomePage } from '@/components/pages';

// Enable SSG for home page
export const dynamic = 'force-static';

export default function Home() {
  return <HomePage />;
}
