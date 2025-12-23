import { MethodologyPage } from '@/components/pages';

// Enable SSG for static content
export const dynamic = 'force-static';

export default function MethodologyPageRoute() {
  return <MethodologyPage />;
}