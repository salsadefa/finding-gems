import Link from 'next/link';

export default function StaticPageShell(props: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const { title, subtitle, children } = props;

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-gray-50 via-white to-white">
      <section className="max-w-5xl mx-auto px-6 lg:px-8 pt-32 pb-10">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 sm:px-10 py-10 sm:py-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500">Dualangka</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-8 prose prose-gray max-w-none">
              {children}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors"
              >
                Back to Explore
              </Link>
              <Link
                href="/requests"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Request a Tool
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
