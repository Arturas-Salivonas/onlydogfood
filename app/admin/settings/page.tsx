import { Container } from '@/components/layout/Container';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your admin panel settings</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-12">
        <div className="text-center text-gray-500">
          <Settings size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Settings Coming Soon
          </h3>
          <p>
            Settings panel will include configuration for scoring weights, currency rates, and more.
          </p>
        </div>
      </div>
    </Container>
  );
}



