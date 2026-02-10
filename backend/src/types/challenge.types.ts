export type ChallengeStatus = 'upcoming' | 'active' | 'ended';
export type ChallengeSubmissionStatus = 'submitted' | 'approved' | 'rejected';

export interface CreateChallengeBody {
  title: string;
  slug: string;
  theme?: string;
  rules?: string;
  coverImage?: string;
  startAt: string;
  endAt: string;
  status?: ChallengeStatus;
}

export interface UpdateChallengeBody {
  title?: string;
  slug?: string;
  theme?: string;
  rules?: string;
  coverImage?: string;
  startAt?: string;
  endAt?: string;
  status?: ChallengeStatus;
}

export interface CreateChallengeSubmissionBody {
  title: string;
  description: string;
  demoUrl: string;
  repoUrl?: string;
  websiteId?: string;
  websiteSlug?: string;
}

export interface UpdateChallengeSubmissionBody {
  title?: string;
  description?: string;
  demoUrl?: string;
  repoUrl?: string;
  websiteId?: string;
  websiteSlug?: string;
}

export interface ReviewChallengeSubmissionBody {
  status: 'approved' | 'rejected';
  adminNote?: string;
  isFeatured?: boolean;
  featuredPosition?: number | null;
}
