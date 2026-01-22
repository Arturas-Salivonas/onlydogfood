import { Loading } from '@/components/ui/Loading';

export default function LoadingBrands() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text="Loading brands..." />
    </div>
  );
}
