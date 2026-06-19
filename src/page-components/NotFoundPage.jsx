'use client';

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <>
             <title>404 - Page Not Found - EntertainIndia</title>
     
      <div className="container-custom py-24 text-center">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-heading font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link href="/" className="btn-primary">
          Go Back Home
        </Link>
      </div>
    </>
  );
}

