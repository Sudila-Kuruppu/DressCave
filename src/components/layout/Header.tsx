import Link from 'next/link';
import { createClient } from '@/lib/supabase/server-client';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-[#FF6F61] hover:text-[#E55A4D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded">
              DressCave
            </Link>
          </div>

          {/* Middle: Category Navigation (will be added later) */}
          <nav className="hidden md:flex items-center space-x-6 category-nav">
            {/* Navigation will be included here when needed */}
            <Link
              href="/category/women"
              className="text-gray-600 hover:text-[#FF6F61] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
            >
              Women
            </Link>
            <Link
              href="/category/kids"
              className="text-gray-600 hover:text-[#FF6F61] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
            >
              Kids
            </Link>
            <Link
              href="/category/men"
              className="text-gray-600 hover:text-[#FF6F61] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
            >
              Men
            </Link>
          </nav>

          {/* Right side: Auth buttons or User menu */}
          <div className="flex items-center">
            {!user ? (
              <div className="auth-buttons flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm sm:text-base text-[#FF6F61] hover:text-[#E55A4D] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm sm:text-base bg-[#FF6F61] text-white rounded-lg hover:bg-[#E55A4D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0]"
                >
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="user-menu">
                {/* User menu will be implemented in future stories */}
                <Link
                  href="/account"
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#FF6F61] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
                >
                  <div className="w-8 h-8 rounded-full bg-[#4FA1A0] flex items-center justify-center text-white font-semibold">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block">
                    {user.email?.split('@')[0] || 'Account'}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile category navigation (shown on small screens only) */}
        <nav className="md:hidden py-2 border-t border-gray-100">
          <div className="flex justify-around">
            <Link
              href="/category/women"
              className="px-2 py-1 text-sm text-gray-600 hover:text-[#FF6F61] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
            >
              Women
            </Link>
            <Link
              href="/category/kids"
              className="px-2 py-1 text-sm text-gray-600 hover:text-[#FF6F61] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
            >
              Kids
            </Link>
            <Link
              href="/category/men"
              className="px-2 py-1 text-sm text-gray-600 hover:text-[#FF6F61] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
            >
              Men
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
