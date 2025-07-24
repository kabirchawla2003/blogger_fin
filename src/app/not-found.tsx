import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="font-serif text-6xl font-bold text-earth-green-800 mb-4">404</h1>
        <h2 className="font-serif text-2xl font-semibold text-earth-green-700 mb-4">
          Story Not Found
        </h2>
        <p className="text-earth-green-600 mb-8 leading-relaxed">
          The page you're looking for seems to have wandered off into the literary wilderness.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
          <Link href="/all-posts" className="btn-secondary inline-flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Browse Stories</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
