'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import Button from '@/components/Button';
import {
  Rocket,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Check,
  ArrowRight,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';

export default function ForCreatorsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Not logged in - redirect to signup first
      router.push('/signup?redirect=/apply-creator');
    } else if (user?.role === 'creator') {
      // Already a creator
      router.push('/creator');
    } else {
      // Logged in as buyer - go to application
      router.push('/apply-creator');
    }
  };

  const benefits = [
    {
      icon: <Users size={24} />,
      title: 'Reach Thousands',
      description: 'Get your tools discovered by an engaged community actively seeking solutions.'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Build Your Brand',
      description: 'Establish credibility with verified creator badges and detailed analytics.'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Track Performance',
      description: 'Monitor views, clicks, and engagement with powerful analytics dashboard.'
    },
    {
      icon: <Star size={24} />,
      title: 'Collect Reviews',
      description: 'Build social proof with authentic reviews from real users.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Verified Status',
      description: 'Stand out with a verified badge that builds trust with potential users.'
    },
    {
      icon: <Zap size={24} />,
      title: 'Simple Listing',
      description: 'List your tools in minutes with our streamlined submission process.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Apply to Join',
      description: 'Submit your application with your background and portfolio.'
    },
    {
      number: '02',
      title: 'Get Verified',
      description: 'Our team reviews applications to ensure quality creators.'
    },
    {
      number: '03',
      title: 'List Your Tools',
      description: 'Create detailed listings for your websites and tools.'
    },
    {
      number: '04',
      title: 'Grow Your Reach',
      description: 'Get discovered by users looking for solutions like yours.'
    }
  ];

  return (
    <div className="for-creators-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Rocket size={16} />
            <span>For Creators</span>
          </div>
          <h1>Share Your Tools with the World</h1>
          <p>
            Join our community of creators and get your websites, tools, and products 
            discovered by thousands of users actively seeking solutions.
          </p>
          <div className="hero-actions">
            <Button onClick={handleApplyClick} size="lg">
              {isAuthenticated && user?.role !== 'creator' 
                ? 'Apply to Become a Creator' 
                : isAuthenticated && user?.role === 'creator'
                  ? 'Go to Creator Dashboard'
                  : 'Get Started'}
              <ArrowRight size={18} />
            </Button>
            {!isAuthenticated && (
              <p className="hero-note">Already have an account? <Link href="/login">Sign in</Link> first</p>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="section-header">
          <h2>Why Join as a Creator?</h2>
          <p>Everything you need to showcase your work and grow your audience.</p>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in just a few simple steps.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="requirements">
        <div className="requirements-content">
          <h2>What We Look For</h2>
          <p>We maintain quality by reviewing all creator applications.</p>
          <ul className="requirements-list">
            <li>
              <Check size={20} className="check-icon" />
              <span>Original tools, websites, or products you've created</span>
            </li>
            <li>
              <Check size={20} className="check-icon" />
              <span>Professional portfolio or work samples</span>
            </li>
            <li>
              <Check size={20} className="check-icon" />
              <span>Clear description of your expertise and background</span>
            </li>
            <li>
              <Check size={20} className="check-icon" />
              <span>Commitment to maintaining quality listings</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Share Your Work?</h2>
        <p>Join our growing community of creators today.</p>
        <Button onClick={handleApplyClick} size="lg" variant="primary">
          {isAuthenticated ? 'Start Your Application' : 'Create Account & Apply'}
        </Button>
      </section>

      <style jsx>{`
        .for-creators-page {
          min-height: 100vh;
          background: var(--background);
        }

        /* Hero */
        .hero {
          padding: 120px 24px 80px;
          text-align: center;
          background: linear-gradient(180deg, var(--gray-50) 0%, var(--background) 100%);
        }
        .hero-content {
          max-width: 640px;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--foreground);
          color: var(--background);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .hero h1 {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .hero p {
          font-size: 1.25rem;
          color: var(--gray-600);
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .hero-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .hero-actions :global(button) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .hero-note {
          font-size: 14px;
          color: var(--gray-500);
        }
        .hero-note a {
          color: var(--foreground);
          font-weight: 500;
        }

        /* Sections */
        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .section-header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .section-header p {
          font-size: 1.125rem;
          color: var(--gray-600);
        }

        /* Benefits */
        .benefits {
          padding: 80px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .benefit-card {
          padding: 32px;
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: 16px;
          transition: all 0.2s;
        }
        .benefit-card:hover {
          border-color: var(--gray-300);
          transform: translateY(-2px);
        }
        .benefit-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-100);
          border-radius: 12px;
          margin-bottom: 16px;
          color: var(--foreground);
        }
        .benefit-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .benefit-card p {
          font-size: 0.95rem;
          color: var(--gray-600);
          line-height: 1.6;
        }

        /* How It Works */
        .how-it-works {
          padding: 80px 24px;
          background: var(--gray-50);
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 32px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .step-card {
          text-align: center;
        }
        .step-number {
          font-size: 3rem;
          font-weight: 800;
          color: var(--gray-200);
          margin-bottom: 16px;
        }
        .step-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .step-card p {
          font-size: 0.95rem;
          color: var(--gray-600);
        }

        /* Requirements */
        .requirements {
          padding: 80px 24px;
          max-width: 640px;
          margin: 0 auto;
        }
        .requirements-content {
          text-align: center;
        }
        .requirements h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .requirements > p {
          color: var(--gray-600);
          margin-bottom: 32px;
        }
        .requirements-list {
          text-align: left;
          list-style: none;
          padding: 0;
        }
        .requirements-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid var(--gray-100);
          font-size: 1rem;
        }
        .requirements-list li:last-child {
          border-bottom: none;
        }
        .requirements-list :global(.check-icon) {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* CTA */
        .cta {
          padding: 80px 24px;
          text-align: center;
          background: var(--foreground);
          color: var(--background);
        }
        .cta h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .cta p {
          font-size: 1.125rem;
          opacity: 0.8;
          margin-bottom: 32px;
        }
        .cta :global(button) {
          background: var(--background);
          color: var(--foreground);
        }
        .cta :global(button:hover) {
          opacity: 0.9;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero {
            padding: 100px 20px 60px;
          }
          .hero h1 {
            font-size: 2rem;
          }
          .hero p {
            font-size: 1rem;
          }
          .section-header h2 {
            font-size: 1.5rem;
          }
          .benefits-grid {
            grid-template-columns: 1fr;
          }
          .steps-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
