-- ============================================
-- Finding Gems Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "UserRole" AS ENUM ('visitor', 'buyer', 'creator', 'admin');
CREATE TYPE "WebsiteStatus" AS ENUM ('draft', 'pending', 'active', 'suspended');
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT UNIQUE NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" DEFAULT 'visitor',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users"("username");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");

-- ============================================
-- CREATOR PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "creator_profiles" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "bio" TEXT,
    "professionalRole" TEXT,
    "institution" TEXT,
    "professionalBackground" TEXT,
    "expertise" TEXT[],
    "portfolioUrl" TEXT,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "xUrl" TEXT,
    "websiteUrl" TEXT,
    "isVerified" BOOLEAN DEFAULT false,
    "verifiedAt" TIMESTAMP WITH TIME ZONE,
    "totalWebsites" INTEGER DEFAULT 0,
    "rating" DECIMAL(3,2) DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_creator_profiles_userId" ON "creator_profiles"("userId");
CREATE INDEX IF NOT EXISTS "idx_creator_profiles_isVerified" ON "creator_profiles"("isVerified");

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT UNIQUE NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "sortOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories"("slug");
CREATE INDEX IF NOT EXISTS "idx_categories_isActive" ON "categories"("isActive");

-- ============================================
-- WEBSITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "websites" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL REFERENCES "categories"("id"),
    "creatorId" TEXT NOT NULL REFERENCES "users"("id"),
    "thumbnail" TEXT NOT NULL,
    "screenshots" TEXT[],
    "demoVideoUrl" TEXT,
    "externalUrl" TEXT NOT NULL,
    "techStack" TEXT[],
    "useCases" TEXT[],
    "hasFreeTrial" BOOLEAN DEFAULT false,
    "freeTrialDetails" TEXT,
    "rating" DECIMAL(3,2) DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    "viewCount" INTEGER DEFAULT 0,
    "clickCount" INTEGER DEFAULT 0,
    "status" "WebsiteStatus" DEFAULT 'draft',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_websites_slug" ON "websites"("slug");
CREATE INDEX IF NOT EXISTS "idx_websites_categoryId" ON "websites"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_websites_creatorId" ON "websites"("creatorId");
CREATE INDEX IF NOT EXISTS "idx_websites_status" ON "websites"("status");
CREATE INDEX IF NOT EXISTS "idx_websites_rating" ON "websites"("rating");
CREATE INDEX IF NOT EXISTS "idx_websites_createdAt" ON "websites"("createdAt");

-- ============================================
-- WEBSITE FAQS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "website_faqs" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "websiteId" TEXT NOT NULL REFERENCES "websites"("id") ON DELETE CASCADE,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_website_faqs_websiteId" ON "website_faqs"("websiteId");

-- ============================================
-- BOOKMARKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "bookmarks" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "websiteId" TEXT NOT NULL REFERENCES "websites"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("websiteId", "userId")
);

CREATE INDEX IF NOT EXISTS "idx_bookmarks_userId" ON "bookmarks"("userId");
CREATE INDEX IF NOT EXISTS "idx_bookmarks_websiteId" ON "bookmarks"("websiteId");

-- ============================================
-- REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "websiteId" TEXT NOT NULL REFERENCES "websites"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "helpfulCount" INTEGER DEFAULT 0,
    "isVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("websiteId", "userId")
);

CREATE INDEX IF NOT EXISTS "idx_reviews_websiteId" ON "reviews"("websiteId");
CREATE INDEX IF NOT EXISTS "idx_reviews_userId" ON "reviews"("userId");
CREATE INDEX IF NOT EXISTS "idx_reviews_rating" ON "reviews"("rating");

-- ============================================
-- MESSAGE THREADS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "message_threads" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "websiteId" TEXT REFERENCES "websites"("id"),
    "unreadCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_message_threads_websiteId" ON "message_threads"("websiteId");
CREATE INDEX IF NOT EXISTS "idx_message_threads_updatedAt" ON "message_threads"("updatedAt");

-- ============================================
-- MESSAGE THREAD PARTICIPANTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "message_thread_participants" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "threadId" TEXT NOT NULL REFERENCES "message_threads"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("threadId", "userId")
);

CREATE INDEX IF NOT EXISTS "idx_message_thread_participants_threadId" ON "message_thread_participants"("threadId");
CREATE INDEX IF NOT EXISTS "idx_message_thread_participants_userId" ON "message_thread_participants"("userId");

-- ============================================
-- REPORTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "reports" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "websiteId" TEXT NOT NULL REFERENCES "websites"("id") ON DELETE CASCADE,
    "reporterId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP WITH TIME ZONE,
    "reviewedBy" TEXT,
    "resolution" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_reports_websiteId" ON "reports"("websiteId");
CREATE INDEX IF NOT EXISTS "idx_reports_reporterId" ON "reports"("reporterId");
CREATE INDEX IF NOT EXISTS "idx_reports_status" ON "reports"("status");

-- ============================================
-- CREATOR APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "creator_applications" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "bio" TEXT NOT NULL,
    "professionalBackground" TEXT,
    "expertise" TEXT[],
    "portfolioUrl" TEXT,
    "motivation" TEXT NOT NULL,
    "status" "ApplicationStatus" DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP WITH TIME ZONE,
    "reviewedBy" TEXT,
    "rejectionReason" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_creator_applications_userId" ON "creator_applications"("userId");
CREATE INDEX IF NOT EXISTS "idx_creator_applications_status" ON "creator_applications"("status");

-- ============================================
-- WEBSITE ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "website_analytics" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "websiteId" TEXT UNIQUE NOT NULL REFERENCES "websites"("id") ON DELETE CASCADE,
    "views" INTEGER DEFAULT 0,
    "clicks" INTEGER DEFAULT 0,
    "ctr" DECIMAL(5,2) DEFAULT 0,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_website_analytics_websiteId" ON "website_analytics"("websiteId");

-- ============================================
-- SEED DATA
-- ============================================

-- Insert categories
INSERT INTO "categories" ("name", "slug", "description", "icon", "color") VALUES
('Productivity', 'productivity', 'Tools to boost your productivity', 'Zap', '#3B82F6'),
('Finance', 'finance', 'Financial management tools', 'TrendingUp', '#10B981'),
('Security', 'security', 'Security and privacy tools', 'Shield', '#EF4444'),
('Administration', 'administration', 'Administrative tools', 'Settings', '#6B7280'),
('Education', 'education', 'Educational platforms and tools', 'Book', '#8B5CF6'),
('AI Tools', 'ai-tools', 'Artificial Intelligence powered tools', 'Sparkles', '#F59E0B');

-- Note: Users will be created via API registration
-- Note: Websites and other data will be created via API or separate seed script

-- ============================================
-- DONE!
-- ============================================

-- ============================================
-- BILLING HELPER FUNCTIONS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  random_part TEXT;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYMM');
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  new_number := 'ORD-' || year_month || '-' || random_part;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  seq_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYMM');
  
  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number ~ ('^INV-' || year_month || '-[0-9]+$') 
      THEN SUBSTRING(invoice_number FROM '[0-9]+$')::INTEGER 
      ELSE 0 
    END
  ), 0) + 1
  INTO seq_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';
  
  new_number := 'INV-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
