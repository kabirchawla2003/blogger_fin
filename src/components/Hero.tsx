// src/components/Hero.tsx
import { DataStorage } from '@/lib/storage';
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';

export default async function Hero() {
  const settings = await DataStorage.getSettings();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Bookshelf Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/bk.jpg"
          alt="Bookshelf background"
          fill
          className="object-cover"
          priority
        />
        {/* Translucent overlay */}
        <div className="absolute inset-0 bg-warm-cream/85 backdrop-blur-sm"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto mb-6">
            <Image
              src="/logo.jpg"
              alt="Ghar nari Logo"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-bold text-earth-green-800 mb-6 drop-shadow-md">
          Ghar nari
        </h1>
        
        <p className="text-xl md:text-2xl text-earth-green-700 mb-8 font-light drop-shadow-sm">
          {settings.tagline}
        </p>
        
        <div className="prose prose-lg mx-auto text-earth-green-700 mb-12">
          <p className="text-lg leading-relaxed drop-shadow-sm">
            {settings.welcomeMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#recent-posts" className="btn-primary shadow-lg">
            Explore Stories
          </a>
          <a href="/all-posts" className="btn-secondary shadow-lg">
            Browse Archive
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <ArrowDown className="h-6 w-6 text-earth-green-600 drop-shadow-md" />
      </div>
    </section>
  );
}
