import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import RecentPosts from '@/components/RecentPosts';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Tailwind CSS Debug Test - Remove this once styling works */}
      
      <Navigation />
      <Hero />
      <RecentPosts />
      <Footer />
    </div>
  );
}
