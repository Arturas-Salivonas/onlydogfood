import { BrandsPage } from '@/components/pages';

// ISR: Regenerate on demand (brands change less frequently)
export const dynamic = 'force-static';

export default function BrandsPageRoute() {
  return <BrandsPage />;
}
