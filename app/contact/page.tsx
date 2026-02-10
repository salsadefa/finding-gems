import StaticPageShell from '@/components/StaticPageShell';

export default function ContactPage() {
  return (
    <StaticPageShell
      title="Contact"
      subtitle="Questions, partnerships, or support."
    >
      <p>
        Email us at <a href="mailto:contact@dualangka.com">contact@dualangka.com</a>.
      </p>
      <p>
        For product requests, use the Requests board so the community can respond.
      </p>
    </StaticPageShell>
  );
}
