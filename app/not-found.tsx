import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="page-wrap">
      <PageHeader title="404" subtitle="The page you are looking for does not exist." />
      <Card>
        <Image src="/arebet-logo.svg" alt="AreBet" width={150} height={45} className="error-logo" />
        <p className="muted">Check the URL or go back to a core section.</p>
        <div className="quick-links">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/help">Help / FAQ</Link>
        </div>
      </Card>
    </main>
  );
}
