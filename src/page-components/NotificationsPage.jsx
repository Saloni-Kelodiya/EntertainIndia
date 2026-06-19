'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
             <title>Notifications - EntertainIndia</title>
     
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-6">Notifications</h1>

          {/* Empty State */}
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-heading font-bold mb-3">No Notifications Yet</h2>
            <p className="text-gray-600 mb-6">
              You don't have any notifications at the moment. We'll notify you when there's something new!
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Go to Homepage
            </button>
          </div>

          {/* Notification Settings */}
          <div className="card p-6 mt-6">
            <h3 className="text-xl font-heading font-bold mb-4">Notification Preferences</h3>
            <p className="text-gray-600 mb-4">
              Manage your notification settings (Coming Soon)
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-gray-700">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span>Email notifications for new articles</span>
              </label>
              <label className="flex items-center gap-3 text-gray-700">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span>Push notifications for breaking news</span>
              </label>
              <label className="flex items-center gap-3 text-gray-700">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span>Weekly newsletter</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

