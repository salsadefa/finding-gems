import StaticPageShell from '@/components/StaticPageShell';

export default function BlogPage() {
  return (
    <StaticPageShell
      title="Blog"
      subtitle="Updates, product notes, and creator stories."
    >
      <p>
        We are preparing our blog. For now, you can follow product updates inside the app.
      </p>
      <p>
        If you want us to write about a specific topic (growth, SEO, AI workflows), post it on the Requests board.
      </p>
    </StaticPageShell>
  );
}
