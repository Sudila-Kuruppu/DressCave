import NewArrivalsSection from '@/components/products/NewArrivalsSection';

export default function Home() {
  return (
    <main className="homepage bg-white dark:bg-black min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 bg-gradient-to-br from-[#FF6F61] to-[#FFA07A] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Style
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Find the perfect outfit that expresses who you are
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-[#FF6F61] px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* New Arrivals Section */}
      <NewArrivalsSection />

      {/* Additional sections can be added here */}
    </main>
  );
}

