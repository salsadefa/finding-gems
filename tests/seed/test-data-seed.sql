-- ============================================
-- Finding Gems - Test Data Seeding Script
-- Run via Supabase Dashboard SQL Editor or MCP
-- Updated: 2026-02-07 (Schema-matched)
-- ============================================

-- NOTE: This script creates test data for QA testing
-- Schema columns verified: 2026-02-07

-- ============================================
-- 1. ADDITIONAL TEST USERS
-- ============================================
-- Users schema: id, email, password, name, username, avatar, role, isActive, createdAt, updatedAt

INSERT INTO public.users (id, email, password, name, username, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'buyer2@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NlQd.S7oG',
  'Test Buyer 2',
  'testbuyer2',
  'buyer',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (id, email, password, name, username, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'buyer3@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NlQd.S7oG',
  'Test Buyer 3',
  'testbuyer3',
  'buyer',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (id, email, password, name, username, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'creator2@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NlQd.S7oG',
  'Test Creator 2',
  'testcreator2',
  'creator',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. QUERY EXISTING DATA (for reference)
-- ============================================

SELECT 'Test Data Summary' as info,
       (SELECT COUNT(*) FROM public.users) as total_users,
       (SELECT COUNT(*) FROM public.users WHERE role = 'buyer') as buyers,
       (SELECT COUNT(*) FROM public.users WHERE role = 'creator') as creators,
       (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as admins,
       (SELECT COUNT(*) FROM public.websites) as total_websites,
       (SELECT COUNT(*) FROM public.orders) as total_orders,
       (SELECT COUNT(*) FROM public.bookmarks) as total_bookmarks;
