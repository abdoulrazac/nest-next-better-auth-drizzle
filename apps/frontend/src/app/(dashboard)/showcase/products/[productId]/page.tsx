// apps/frontend/src/app/(dashboard)/showcase/products/[productId]/page.tsx
import { ProductDetailPage } from "@/features/showcase/products/detail-page";

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function Page({ params }: Props) {
  const { productId } = await params;
  return <ProductDetailPage productId={productId} />;
}
