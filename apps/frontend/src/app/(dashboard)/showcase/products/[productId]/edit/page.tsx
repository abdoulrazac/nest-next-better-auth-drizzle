// apps/frontend/src/app/(dashboard)/showcase/products/[productId]/edit/page.tsx
import { ProductEditPage } from "@/features/showcase/products/edit-page";

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function Page({ params }: Props) {
  const { productId } = await params;
  return <ProductEditPage productId={productId} />;
}
