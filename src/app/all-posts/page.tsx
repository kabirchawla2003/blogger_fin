// src/app/all-posts/page.tsx (Enhanced Version)
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AllPostsClient from '@/components/AllPostsClient';
import ErrorBoundary from '@/components/ErrorBoundary';
import { DataStorage } from '@/lib/storage';
import { BlogPost } from '@/lib/types';

export default async function AllPostsPage() {
  try {
    // Server-side data fetching with enhanced filtering
    const posts = await DataStorage.getPosts();
    
    // Enhanced server-side filtering for quality assurance
    const publishedPosts: BlogPost[] = posts.filter(post => {
      // Basic published status check
      if (post.status !== 'published') return false;
      
      // Ensure publishedAt exists and is not empty
      if (!post.publishedAt || post.publishedAt.trim() === '') return false;
      
      // Ensure essential fields exist
      if (!post.title.trim() || !post.slug.trim()) return false;
      
      // Validate publishedAt is a valid date
      try {
        const date = new Date(post.publishedAt);
        if (isNaN(date.getTime())) return false;
        
        // Don't show future scheduled posts (unless in preview mode)
        if (date.getTime() > Date.now()) return false;
      } catch {
        return false;
      }
      
      return true;
    });
    
    // Get unique categories with null safety
    const categories: string[] = [];
    publishedPosts.forEach((post) => {
      if (post.category && post.category.trim() !== '' && !categories.includes(post.category)) {
        categories.push(post.category);
      }
    });

    // Sort categories alphabetically
    categories.sort();

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-warm-cream">
          <Navigation />
          
          <main className="pt-20">
            {/* Header */}
            <section className="bg-earth-green-600 text-white py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  All Stories
                </h1>
                <p className="text-xl text-earth-green-100 max-w-2xl">
                  Explore the complete collection of tales, insights, and musings from my literary journey.
                </p>
                
                {/* Show post count */}
                <div className="mt-6 text-earth-green-200">
                  <span className="text-2xl font-bold">{publishedPosts.length}</span>
                  <span className="ml-2">published {publishedPosts.length === 1 ? 'story' : 'stories'}</span>
                  {categories.length > 0 && (
                    <span className="ml-4">across {categories.length} {categories.length === 1 ? 'category' : 'categories'}</span>
                  )}
                </div>
              </div>
            </section>

            {/* Client-side filtering and search */}
            <AllPostsClient posts={publishedPosts} categories={categories} />
          </main>

          <Footer />
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error in AllPostsPage:', error);
    
    // Fallback UI for server-side errors
    return (
      <div className="min-h-screen bg-warm-cream">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="font-serif text-3xl font-bold text-earth-green-800 mb-4">
              Unable to Load Posts
            </h1>
            <p className="text-earth-green-600 mb-6">
              We're having trouble loading the blog posts right now. Please try again later.
            </p>
            <a href="/" className="btn-primary">
              Return to Home
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
