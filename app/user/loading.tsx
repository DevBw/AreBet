import { SkeletonList } from "@/components/ui/skeleton";

export default function UserLoading() {
  return (
    <main className="page-wrap">
      <SkeletonList rows={2} />
    </main>
  );
}
