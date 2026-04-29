import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container py-5 text-center">
      <h1 className="display-6 mb-3">Not found</h1>
      <p className="text-muted mb-4">This item doesn&apos;t exist or isn&apos;t public.</p>
      <div className="d-flex gap-2 justify-content-center">
        <Link href="/" className="btn btn-primary">Home</Link>
        <Link href="/browse" className="btn btn-outline-secondary">Browse collection</Link>
      </div>
    </main>
  );
}
