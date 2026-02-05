'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useToast } from '@/lib/store';
import { useCreatorApplication, useMyCreatorApplication } from '@/lib/api/creator-application';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase,
  Link as LinkIcon,
  FileText,
  Sparkles
} from 'lucide-react';

export default function ApplyCreatorPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const { data: existingApplication, isLoading: applicationLoading } = useMyCreatorApplication();
  const applyMutation = useCreatorApplication();

  const [bio, setBio] = useState('');
  const [professionalBackground, setProfessionalBackground] = useState('');
  const [expertise, setExpertise] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [motivation, setMotivation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signup?redirect=/apply-creator');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect if already a creator
  useEffect(() => {
    if (user?.role === 'creator') {
      router.push('/creator');
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!bio || bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (!motivation || motivation.length < 100) {
      newErrors.motivation = 'Please provide more detail about your motivation (at least 100 characters)';
    }

    if (portfolioUrl && !isValidUrl(portfolioUrl)) {
      newErrors.portfolioUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await applyMutation.mutateAsync({
        bio,
        professionalBackground: professionalBackground || undefined,
        expertise: expertise ? expertise.split(',').map(e => e.trim()).filter(Boolean) : [],
        portfolioUrl: portfolioUrl || undefined,
        motivation,
      });

      showToast('Application submitted successfully! We\'ll review it shortly.', 'success');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to submit application. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  // Loading states
  if (authLoading || applicationLoading) {
    return (
      <div className="loading-page">
        <Loader2 size={32} className="animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  // Already applied - show status
  if (existingApplication) {
    return (
      <div className="status-page">
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="status-card">
          {existingApplication.status === 'pending' && (
            <>
              <div className="status-icon pending">
                <Clock size={48} />
              </div>
              <h1>Application Under Review</h1>
              <p>
                Thanks for applying! Our team is reviewing your application. 
                This usually takes 1-2 business days. We'll email you once we've made a decision.
              </p>
              <div className="application-info">
                <p><strong>Submitted:</strong> {new Date(existingApplication.createdAt).toLocaleDateString()}</p>
              </div>
            </>
          )}

          {existingApplication.status === 'approved' && (
            <>
              <div className="status-icon approved">
                <CheckCircle size={48} />
              </div>
              <h1>Congratulations! You're Approved!</h1>
              <p>
                Your creator application has been approved. You can now access the Creator Dashboard
                and start listing your tools.
              </p>
              <Button onClick={() => router.push('/creator')}>
                Go to Creator Dashboard
              </Button>
            </>
          )}

          {existingApplication.status === 'rejected' && (
            <>
              <div className="status-icon rejected">
                <XCircle size={48} />
              </div>
              <h1>Application Not Approved</h1>
              <p>
                Unfortunately, we couldn't approve your application at this time.
                {existingApplication.rejectionReason && (
                  <span className="rejection-reason">
                    <br /><br />
                    <strong>Reason:</strong> {existingApplication.rejectionReason}
                  </span>
                )}
              </p>
              <p className="retry-note">
                You may apply again after addressing the feedback above.
              </p>
            </>
          )}
        </div>

        <style jsx>{`
          .status-page {
            min-height: 100vh;
            padding: 100px 24px 60px;
            background: var(--gray-50);
          }
          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--gray-600);
            font-size: 14px;
            margin-bottom: 32px;
          }
          .back-link:hover {
            color: var(--foreground);
          }
          .status-card {
            max-width: 480px;
            margin: 0 auto;
            padding: 48px;
            background: var(--background);
            border-radius: 16px;
            border: 1px solid var(--gray-200);
            text-align: center;
          }
          .status-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          .status-icon.pending {
            background: #fef3c7;
            color: #f59e0b;
          }
          .status-icon.approved {
            background: #d1fae5;
            color: #10b981;
          }
          .status-icon.rejected {
            background: #fee2e2;
            color: #ef4444;
          }
          .status-card h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 16px;
          }
          .status-card p {
            color: var(--gray-600);
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .application-info {
            padding: 16px;
            background: var(--gray-50);
            border-radius: 8px;
            font-size: 14px;
          }
          .rejection-reason {
            display: block;
            padding: 16px;
            background: #fef2f2;
            border-radius: 8px;
            margin-top: 16px;
          }
          .retry-note {
            font-size: 14px;
            color: var(--gray-500);
          }
        `}</style>
      </div>
    );
  }

  // Application form
  return (
    <div className="apply-page">
      <Link href="/for-creators" className="back-link">
        <ArrowLeft size={18} />
        Back to Creator Info
      </Link>

      <div className="apply-card">
        <div className="apply-header">
          <div className="header-icon">
            <Sparkles size={28} />
          </div>
          <h1>Apply to Become a Creator</h1>
          <p>Tell us about yourself and what you'd like to share with the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="apply-form">
          <div className="form-section">
            <div className="section-header">
              <FileText size={18} />
              <h3>About You</h3>
            </div>
            
            <div className="form-group">
              <label>Bio *</label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  if (errors.bio) setErrors({ ...errors, bio: '' });
                }}
                placeholder="Tell us about yourself, your background, and what you do..."
                rows={4}
                className={errors.bio ? 'error' : ''}
              />
              {errors.bio && <span className="error-text">{errors.bio}</span>}
              <span className="char-count">{bio.length} / 50 min</span>
            </div>

            <div className="form-group">
              <label>Professional Background</label>
              <Input
                value={professionalBackground}
                onChange={(e) => setProfessionalBackground(e.target.value)}
                placeholder="e.g., Software Engineer at Google, 5 years experience"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Briefcase size={18} />
              <h3>Expertise & Portfolio</h3>
            </div>

            <div className="form-group">
              <label>Areas of Expertise</label>
              <Input
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g., Web Development, UI Design, Machine Learning (comma separated)"
              />
              <span className="helper-text">Separate multiple areas with commas</span>
            </div>

            <div className="form-group">
              <label>Portfolio URL</label>
              <Input
                value={portfolioUrl}
                onChange={(e) => {
                  setPortfolioUrl(e.target.value);
                  if (errors.portfolioUrl) setErrors({ ...errors, portfolioUrl: '' });
                }}
                placeholder="https://yourportfolio.com"
                error={errors.portfolioUrl}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Sparkles size={18} />
              <h3>Your Motivation</h3>
            </div>

            <div className="form-group">
              <label>Why do you want to become a creator? *</label>
              <textarea
                value={motivation}
                onChange={(e) => {
                  setMotivation(e.target.value);
                  if (errors.motivation) setErrors({ ...errors, motivation: '' });
                }}
                placeholder="Tell us what tools you'd like to share, why you're passionate about them, and how you think they can help others..."
                rows={5}
                className={errors.motivation ? 'error' : ''}
              />
              {errors.motivation && <span className="error-text">{errors.motivation}</span>}
              <span className="char-count">{motivation.length} / 100 min</span>
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              fullWidth
              loading={applyMutation.isPending}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
            <p className="form-note">
              By submitting, you agree to our creator terms and guidelines.
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .apply-page {
          min-height: 100vh;
          padding: 100px 24px 60px;
          background: var(--gray-50);
        }
        .loading-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--gray-500);
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--gray-600);
          font-size: 14px;
          margin-bottom: 32px;
        }
        .back-link:hover {
          color: var(--foreground);
        }
        .apply-card {
          max-width: 600px;
          margin: 0 auto;
          padding: 48px;
          background: var(--background);
          border-radius: 16px;
          border: 1px solid var(--gray-200);
        }
        .apply-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header-icon {
          width: 56px;
          height: 56px;
          background: var(--foreground);
          color: var(--background);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .apply-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .apply-header p {
          color: var(--gray-600);
        }
        .apply-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--gray-100);
        }
        .section-header h3 {
          font-size: 1rem;
          font-weight: 600;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-700);
        }
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }
        .form-group textarea:focus {
          outline: none;
          border-color: var(--foreground);
        }
        .form-group textarea.error {
          border-color: #ef4444;
        }
        .error-text {
          font-size: 13px;
          color: #ef4444;
        }
        .char-count {
          font-size: 12px;
          color: var(--gray-400);
          text-align: right;
        }
        .helper-text {
          font-size: 12px;
          color: var(--gray-500);
        }
        .form-actions {
          margin-top: 16px;
        }
        .form-note {
          text-align: center;
          font-size: 13px;
          color: var(--gray-500);
          margin-top: 16px;
        }

        @media (max-width: 640px) {
          .apply-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}
