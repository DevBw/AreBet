import { SkeletonList } from "@/components/ui/skeleton";

export default function WidgetsLoading() {
  return (
    <main className="page-wrap">
      <SkeletonList rows={3} />
    </main>
  );
}
