import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui/Loading';

const DogFoodPage = dynamic(() => import('@/components/pages').then(mod => ({ default: mod.DogFoodPage })), {
  loading: () => <Loading size="lg" text="Loading Dog Food ..." />,
});

// ISR: Regenerate every hour
export const revalidate = 3600;

export default function DogFoodPageRoute() {
  return <DogFoodPage />;
}
