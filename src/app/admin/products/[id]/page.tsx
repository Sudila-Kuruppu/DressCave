'use client';

import { use } from 'react';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ProductEditPage({ params }: Props) {
  const { id } = use(params);

  return (
    <div>
      <h1>Edit Product</h1>
      <p>Product ID: {id}</p>
    </div>
  );
}
