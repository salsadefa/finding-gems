// ============================================
// Prisma Seed - Finding Gems Backend
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data
  await prisma.bookmark.deleteMany();
  await prisma.review.deleteMany();
  await prisma.websiteFAQ.deleteMany();
  await prisma.websiteAnalytics.deleteMany();
  await prisma.website.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminPassword123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@findinggems.com',
      password: adminPassword,
      name: 'Admin User',
      username: 'admin',
      role: 'admin' as any,
      isActive: true,
    },
  });
  console.log(`✅ Created admin user: ${admin.email}`);

  // Create sample users
  const sampleUsers = [
    {
      email: 'buyer@example.com',
      password: await bcrypt.hash('BuyerPassword123!', 12),
      name: 'John Buyer',
      username: 'johnbuyer',
      role: 'buyer' as any,
    },
    {
      email: 'creator@example.com',
      password: await bcrypt.hash('CreatorPassword123!', 12),
      name: 'Jane Creator',
      username: 'janecreator',
      role: 'creator' as any,
    },
    {
      email: 'creator2@example.com',
      password: await bcrypt.hash('CreatorPassword123!', 12),
      name: 'Bob Developer',
      username: 'bobdev',
      role: 'creator' as any,
    },
  ];

  for (const userData of sampleUsers) {
    const user = await prisma.user.create({
      data: userData as any,
    });
    console.log(`✅ Created user: ${user.email} (${user.role})`);
  }

  // Create creator profiles
  const creator1 = await prisma.user.findUnique({ where: { email: 'creator@example.com' } });
  const creator2 = await prisma.user.findUnique({ where: { email: 'creator2@example.com' } });

  if (creator1) {
    await prisma.creatorProfile.create({
      data: {
        userId: creator1.id,
        bio: 'Full-stack developer with 5+ years of experience building SaaS products.',
        professionalRole: 'Senior Frontend Engineer',
        institution: 'at Tech Corp',
        professionalBackground: 'Full-Stack Developer',
        expertise: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        portfolioUrl: 'https://janecreator.dev',
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
    console.log(`✅ Created creator profile for: ${creator1.email}`);
  }

  if (creator2) {
    await prisma.creatorProfile.create({
      data: {
        userId: creator2.id,
        bio: 'UI/UX Designer and developer creating beautiful web applications.',
        professionalRole: 'UI/UX Designer',
        professionalBackground: 'UI/UX Designer',
        expertise: ['UI Design', 'Figma', 'React', 'Tailwind CSS'],
        portfolioUrl: 'https://bobdesigns.dev',
        isVerified: false,
      },
    });
    console.log(`✅ Created creator profile for: ${creator2.email}`);
  }

  // Create categories
  const categories = [
    { name: 'Productivity', slug: 'productivity', description: 'Tools to boost your productivity', icon: 'Zap', color: '#3B82F6' },
    { name: 'Finance', slug: 'finance', description: 'Financial management tools', icon: 'TrendingUp', color: '#10B981' },
    { name: 'Security', slug: 'security', description: 'Security and privacy tools', icon: 'Shield', color: '#EF4444' },
    { name: 'Administration', slug: 'administration', description: 'Administrative tools', icon: 'Settings', color: '#6B7280' },
    { name: 'Education', slug: 'education', description: 'Educational platforms and tools', icon: 'Book', color: '#8B5CF6' },
    { name: 'AI Tools', slug: 'ai-tools', description: 'Artificial Intelligence powered tools', icon: 'Sparkles', color: '#F59E0B' },
  ];

  const createdCategories: any[] = [];
  for (const catData of categories) {
    const category = await prisma.category.create({
      data: catData,
    });
    createdCategories.push(category);
    console.log(`✅ Created category: ${category.name}`);
  }

  // Create sample websites
  if (creator1 && createdCategories[0]) {
    const website1 = await prisma.website.create({
      data: {
        name: 'TaskMaster Pro',
        slug: 'taskmaster-pro',
        description: 'A powerful project management tool designed for modern teams. Features include kanban boards, time tracking, team collaboration, and comprehensive reporting.',
        shortDescription: 'Project management for modern teams',
        categoryId: createdCategories[0].id,
        creatorId: creator1.id,
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
        screenshots: [
          'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
          'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800',
        ],
        externalUrl: 'https://taskmaster-pro.example.com',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
        useCases: ['Team collaboration', 'Project tracking', 'Time management'],
        hasFreeTrial: true,
        freeTrialDetails: '14-day free trial with full features',
        rating: 4.8,
        reviewCount: 124,
        viewCount: 2340,
        clickCount: 456,
        status: 'active' as any,
      },
    });

    // Add FAQs
    await prisma.websiteFAQ.createMany({
      data: [
        {
          websiteId: website1.id,
          question: 'Is there a free trial?',
          answer: 'Yes! We offer a 14-day free trial with access to all features.',
          sortOrder: 0,
        },
        {
          websiteId: website1.id,
          question: 'Can I cancel anytime?',
          answer: 'Absolutely. You can cancel your subscription at any time with no questions asked.',
          sortOrder: 1,
        },
      ],
    });

    // Add analytics
    await prisma.websiteAnalytics.create({
      data: {
        websiteId: website1.id,
        views: 2340,
        clicks: 456,
        ctr: 19.48,
      },
    });

    console.log(`✅ Created website: ${website1.name}`);
  }

  if (creator2 && createdCategories[1]) {
    const website2 = await prisma.website.create({
      data: {
        name: 'FinanceFlow',
        slug: 'financeflow',
        description: 'Personal finance management made simple. Track expenses, create budgets, and achieve your financial goals with intuitive visualizations.',
        shortDescription: 'Personal finance management made simple',
        categoryId: createdCategories[1].id,
        creatorId: creator2.id,
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
        screenshots: [
          'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
        ],
        externalUrl: 'https://financeflow.example.com',
        techStack: ['Vue.js', 'Firebase', 'Tailwind CSS'],
        useCases: ['Budget tracking', 'Expense management', 'Financial goals'],
        hasFreeTrial: true,
        freeTrialDetails: 'Free tier available with premium features',
        rating: 4.5,
        reviewCount: 89,
        viewCount: 1890,
        clickCount: 312,
        status: 'active' as any,
      },
    });

    await prisma.websiteAnalytics.create({
      data: {
        websiteId: website2.id,
        views: 1890,
        clicks: 312,
        ctr: 16.50,
      },
    });

    console.log(`✅ Created website: ${website2.name}`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\nTest Accounts:');
  console.log('  Admin:    admin@findinggems.com / AdminPassword123!');
  console.log('  Buyer:    buyer@example.com / BuyerPassword123!');
  console.log('  Creator:  creator@example.com / CreatorPassword123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
