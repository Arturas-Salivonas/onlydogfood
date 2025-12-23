import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui/Loading';

const ComparePage = dynamic(() => import('@/components/pages').then(mod => ({ default: mod.ComparePage })), {
  loading: () => <Loading size="lg" text="Loading compare page..." />,
});

export default function ComparePageRoute() {
  return <ComparePage />;
}
