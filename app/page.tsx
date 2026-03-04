import { Suspense } from "react";
import { HomeBoard } from "@/components/features/home-board";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return (
    <Suspense>
      <HomeBoard />
    </Suspense>
  );
}
