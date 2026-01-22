import { Loading } from '@/components/ui/Loading';

export default function LoadingCompare() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text="Loading comparison..." />
    </div>
  );
}
