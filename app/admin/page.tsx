import { getServiceSupabase } from '@/lib/supabase';
import { Container } from '@/components/layout/Container';
import { Package, Store, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const supabase = getServiceSupabase();

  const [
    { count: totalProducts },
    { count: totalBrands },
    { data: recentProducts },
    { data: topBrands },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('*, brand:brands(*)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('brands')
      .select('*')
      .order('overall_score', { ascending: false, nullsFirst: false })
      .limit(5),
  ]);

  return {
    totalProducts: totalProducts || 0,
    totalBrands: totalBrands || 0,
    recentProducts: recentProducts || [],
    topBrands: topBrands || [],
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the OnlyDogFood.com admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
          href="/admin/products"
        />
        <StatCard
          title="Total Brands"
          value={stats.totalBrands}
          icon={Store}
          color="green"
          href="/admin/brands"
        />
        <StatCard
          title="Avg Score"
          value="72"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link
              href="/admin/products"
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentProducts.length > 0 ? (
              stats.recentProducts.map((product) => (
                <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.brand?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {Math.round(product.overall_score || 0)}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No products yet
              </div>
            )}
          </div>
        </div>

        {/* Top Brands */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Top Brands</h2>
            <Link
              href="/admin/brands"
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.topBrands.length > 0 ? (
              stats.topBrands.map((brand, index) => (
                <div key={brand.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{brand.name}</h3>
                        <p className="text-sm text-gray-500">
                          {brand.total_products} products
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {Math.round(brand.overall_score || 0)}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No brands yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/products/new"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-4 rounded-lg text-center font-semibold transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/brands/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg text-center font-semibold transition-colors"
          >
            + Add New Brand
          </Link>
        </div>
      </div>
    </Container>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  href?: string;
}

function StatCard({ title, value, icon: Icon, color, href }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-background text-primary',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-secondary-50 text-secondary-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const content = (
    <>
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {content}
    </div>
  );
}
