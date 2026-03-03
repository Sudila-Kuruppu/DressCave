'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
  { name: 'Women', slug: 'women' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Men', slug: 'men' },
];

export default function CategoryNav() {
  const pathname = usePathname();
  
  // Extract current category from pathname (e.g., /category/women -> women)
  const currentCategory = pathname.match(/category\/(.+)/)?.[1];

  return (
    <nav className="category-nav">
      <ul className="category-nav__list">
        {categories.map((category) => {
          const isActive = currentCategory === category.slug;
          return (
            <li key={category.slug} className="category-nav__item">
              <Link
                href={`/category/${category.slug}`}
                className={`category-nav__link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
