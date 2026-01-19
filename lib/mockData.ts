// ============================================
// DUALANGKA MOCK DATA
// Comprehensive sample data for all features
// ============================================

import {
    User,
    CreatorProfile,
    Category,
    Website,
    Review,
    Bookmark,
    MessageThread,
    Message,
    Report,
    CreatorApplication,
    PlatformStats,
} from './types';

// ============================================
// USERS
// ============================================

export const mockUsers: User[] = [
    {
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Buyer',
        username: 'johnbuyer',
        avatar: '',
        role: 'buyer',
        createdAt: '2025-10-15T08:00:00Z',
    },
    {
        id: 'user-2',
        email: 'sarah@creator.com',
        name: 'Sarah Chen',
        username: 'sarahchen',
        avatar: '',
        role: 'creator',
        createdAt: '2025-09-01T08:00:00Z',
    },
    {
        id: 'user-3',
        email: 'mike@creator.com',
        name: 'Mike Rodriguez',
        username: 'mikerodriguez',
        avatar: '',
        role: 'creator',
        createdAt: '2025-08-15T08:00:00Z',
    },
    {
        id: 'user-4',
        email: 'emma@buyer.com',
        name: 'Emma Wilson',
        username: 'emmawilson',
        avatar: '',
        role: 'buyer',
        createdAt: '2025-11-01T08:00:00Z',
    },
    {
        id: 'user-5',
        email: 'admin@dualangka.com',
        name: 'Admin User',
        username: 'admin',
        avatar: '',
        role: 'admin',
        createdAt: '2025-01-01T08:00:00Z',
    },
    {
        id: 'user-6',
        email: 'alex@creator.com',
        name: 'Alex Thompson',
        username: 'alexthompson',
        avatar: '',
        role: 'creator',
        createdAt: '2025-07-20T08:00:00Z',
    },
];

// ============================================
// CREATOR PROFILES
// ============================================

export const mockCreatorProfiles: CreatorProfile[] = [
    {
        userId: 'user-2',
        bio: 'Full-stack developer with 8 years of experience building productivity tools. Passionate about creating software that helps people work smarter.',
        role: 'Senior Software Engineer',
        institution: 'at GoTo Financial',
        professionalBackground: 'Senior Software Engineer',
        expertise: ['React', 'Node.js', 'AI/ML', 'SaaS'],
        portfolioUrl: 'https://sarahchen.dev',
        isVerified: true,
        verifiedAt: '2025-09-05T08:00:00Z',
        totalWebsites: 4,
        rating: 4.8,
        reviewCount: 89,
        socialLinks: {
            linkedin: 'https://linkedin.com/in/sarahchen',
            x: 'https://twitter.com/sarahchen',
            website: 'https://sarahchen.dev',
        },
        otherProducts: [
            {
                id: 'web-4',
                name: 'LearnCode Interactive',
                slug: 'learncode-interactive',
                thumbnail: 'https://picsum.photos/seed/learncode/800/600',
                category: { name: 'Education' },
            },
            {
                id: 'web-8',
                name: 'QuizMaster Pro',
                slug: 'quizmaster-pro',
                thumbnail: 'https://picsum.photos/seed/quizmaster/800/600',
                category: { name: 'Education' },
            },
        ],
    },
    {
        userId: 'user-3',
        bio: 'UI/UX designer turned developer. I build beautiful, functional tools that solve real business problems.',
        role: 'Product Designer',
        institution: 'at Tokopedia',
        professionalBackground: 'UI/UX Designer & Developer',
        expertise: ['Design Systems', 'Figma', 'React', 'TailwindCSS'],
        portfolioUrl: 'https://mikerodriguez.design',
        isVerified: true,
        verifiedAt: '2025-08-20T08:00:00Z',
        totalWebsites: 3,
        rating: 4.6,
        reviewCount: 52,
        socialLinks: {
            linkedin: 'https://linkedin.com/in/mikerodriguez',
            instagram: 'https://instagram.com/mike.design',
        },
        otherProducts: [
            {
                id: 'web-5',
                name: 'BudgetWise',
                slug: 'budgetwise',
                thumbnail: 'https://picsum.photos/seed/budgetwise/800/600',
                category: { name: 'Finance' },
            },
        ],
    },
    {
        userId: 'user-6',
        bio: 'AI enthusiast building the future of automation. Specialized in creating AI-powered tools that save hours of manual work.',
        role: 'AI Researcher',
        institution: 'Indie Hacker',
        professionalBackground: 'AI Engineer',
        expertise: ['Python', 'Machine Learning', 'GPT', 'Automation'],
        portfolioUrl: 'https://alexthompson.ai',
        isVerified: true,
        verifiedAt: '2025-07-25T08:00:00Z',
        totalWebsites: 5,
        rating: 4.9,
        reviewCount: 156,
        socialLinks: {
            x: 'https://twitter.com/alex_ai',
            website: 'https://alexthompson.ai',
            tiktok: 'https://tiktok.com/@alex_ai',
        },
        otherProducts: [
            {
                id: 'web-3',
                name: 'AI Invoice Assistant',
                slug: 'ai-invoice-assistant',
                thumbnail: 'https://picsum.photos/seed/ai-invoice/800/600',
                category: { name: 'Administration' },
            },
            {
                id: 'web-7',
                name: 'MeetingMind',
                slug: 'meetingmind',
                thumbnail: 'https://picsum.photos/seed/meetingmind/800/600',
                category: { name: 'Productivity' },
            },
        ],
    },
];

// ============================================
// CATEGORIES
// ============================================

export const mockCategories: Category[] = [
    {
        id: 'cat-1',
        name: 'Productivity',
        slug: 'productivity',
        description: 'Tools to boost your efficiency and get more done',
        websiteCount: 42,
    },
    {
        id: 'cat-2',
        name: 'Administration',
        slug: 'administration',
        description: 'Business and administrative management tools',
        websiteCount: 28,
    },
    {
        id: 'cat-3',
        name: 'Education',
        slug: 'education',
        description: 'Learning and educational platforms',
        websiteCount: 35,
    },
    {
        id: 'cat-4',
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Fun and entertainment applications',
        websiteCount: 19,
    },
    {
        id: 'cat-5',
        name: 'Finance',
        slug: 'finance',
        description: 'Financial tools and calculators',
        websiteCount: 23,
    },
    {
        id: 'cat-6',
        name: 'AI Tools',
        slug: 'ai-tools',
        description: 'AI-powered applications and utilities',
        websiteCount: 31,
    },
];

// Helper to get category by ID
const getCategoryById = (id: string) => mockCategories.find(c => c.id === id)!;
const getUserById = (id: string) => mockUsers.find(u => u.id === id)!;
const getCreatorProfile = (userId: string) => mockCreatorProfiles.find(p => p.userId === userId)!;

// ============================================
// WEBSITES
// ============================================

export const mockWebsites: Website[] = [
    {
        id: 'web-1',
        name: 'DocuGen Pro',
        slug: 'docugen-pro',
        description: `DocuGen Pro is an AI-powered document generation platform designed for businesses that need to create professional documents quickly and consistently.

Our platform supports a wide range of document types including contracts, proposals, reports, and formal letters. With smart templates and AI assistance, you can generate polished documents in minutes instead of hours.

Key features include:
- 50+ professional templates
- AI-powered content suggestions
- Brand customization
- Team collaboration
- Export to PDF, Word, and more`,
        shortDescription: 'AI-powered document generation for business professionals',
        categoryId: 'cat-1',
        category: getCategoryById('cat-1'),
        creatorId: 'user-2',
        creator: getUserById('user-2'),
        creatorProfile: getCreatorProfile('user-2'),
        thumbnail: 'https://picsum.photos/seed/docugen-pro/800/600',
        screenshots: [
            '/api/placeholder/800/500',
            '/api/placeholder/800/500',
            '/api/placeholder/800/500',
        ],
        demoVideoUrl: 'https://example.com/demo.mp4',
        externalUrl: 'https://docugen-pro.example.com',
        techStack: ['React', 'Node.js', 'OpenAI GPT-4', 'PostgreSQL'],
        useCases: [
            'Generating formal letters for corporate HR needs',
            'Creating client proposals with consistent branding',
            'Drafting legal contracts with AI assistance',
            'Building monthly reports from templates',
        ],
        faq: [
            {
                question: 'Can I customize the templates?',
                answer: 'Yes! All templates are fully customizable. You can add your brand colors, logo, and modify the structure to match your needs.',
            },
            {
                question: 'Is my data secure?',
                answer: 'Absolutely. We use enterprise-grade encryption and your documents are stored securely. We never share or use your data for AI training.',
            },
            {
                question: 'Do you offer a free trial?',
                answer: 'Yes, we offer a 7-day free trial with access to all features. No credit card required.',
            },
        ],
        // Pricing removed

        hasFreeTrial: true,
        freeTrialDetails: '7-day trial with full access to all features',
        rating: 4.8,
        reviewCount: 47,
        viewCount: 2840,
        clickCount: 892,
        status: 'active',
        createdAt: '2025-09-15T08:00:00Z',
        updatedAt: '2025-12-20T08:00:00Z',
    },
    {
        id: 'web-2',
        name: 'TaskFlow',
        slug: 'taskflow',
        description: `TaskFlow is a minimalist project management tool built for small teams who want simplicity without sacrificing power.

Unlike bloated project management software, TaskFlow focuses on what matters: tasks, deadlines, and team collaboration. Our clean interface helps teams stay focused and productive.

Perfect for startups, agencies, and remote teams who need to move fast.`,
        shortDescription: 'Minimalist project management for agile teams',
        categoryId: 'cat-1',
        category: getCategoryById('cat-1'),
        creatorId: 'user-3',
        creator: getUserById('user-3'),
        creatorProfile: getCreatorProfile('user-3'),
        thumbnail: 'https://picsum.photos/seed/taskflow/800/600',
        screenshots: ['/api/placeholder/800/500', '/api/placeholder/800/500'],
        externalUrl: 'https://taskflow.example.com',
        techStack: ['Next.js', 'Supabase', 'TailwindCSS'],
        useCases: [
            'Sprint planning for development teams',
            'Client project tracking for agencies',
            'Personal productivity and goal tracking',
        ],
        faq: [
            {
                question: 'How many team members can I add?',
                answer: 'The starter plan supports up to 5 members. Pro plans support unlimited members.',
            },
        ],
        // Pricing removed

        hasFreeTrial: true,
        freeTrialDetails: '14-day trial on Pro plan',
        rating: 4.5,
        reviewCount: 32,
        viewCount: 1920,
        clickCount: 478,
        status: 'active',
        createdAt: '2025-08-20T08:00:00Z',
        updatedAt: '2025-12-15T08:00:00Z',
    },
    {
        id: 'web-3',
        name: 'AI Invoice Assistant',
        slug: 'ai-invoice-assistant',
        description: `Never manually create invoices again. AI Invoice Assistant uses artificial intelligence to generate, track, and manage your invoices automatically.

Simply describe your work or paste a project summary, and our AI will create a professional invoice in seconds. Track payments, send reminders, and get insights into your cash flow.`,
        shortDescription: 'Automate your invoicing with AI-powered generation',
        categoryId: 'cat-2',
        category: getCategoryById('cat-2'),
        creatorId: 'user-6',
        creator: getUserById('user-6'),
        creatorProfile: getCreatorProfile('user-6'),
        thumbnail: 'https://picsum.photos/seed/ai-invoice/800/600',
        screenshots: ['/api/placeholder/800/500', '/api/placeholder/800/500', '/api/placeholder/800/500'],
        externalUrl: 'https://ai-invoice.example.com',
        techStack: ['Python', 'FastAPI', 'OpenAI', 'React'],
        useCases: [
            'Freelancer invoice management',
            'Small business billing automation',
            'Consultant time tracking and billing',
        ],
        faq: [
            {
                question: 'Does it integrate with my accounting software?',
                answer: 'Yes! We integrate with QuickBooks, Xero, and Wave.',
            },
            {
                question: 'Can I customize invoice templates?',
                answer: 'Absolutely. Full branding customization is included.',
            },
        ],
        // Pricing removed

        hasFreeTrial: false,
        rating: 4.9,
        reviewCount: 78,
        viewCount: 3450,
        clickCount: 1203,
        status: 'active',
        createdAt: '2025-07-25T08:00:00Z',
        updatedAt: '2025-12-18T08:00:00Z',
    },
    {
        id: 'web-4',
        name: 'LearnCode Interactive',
        slug: 'learncode-interactive',
        description: `An interactive coding education platform with hands-on exercises, real-time feedback, and personalized learning paths.

Built for beginners and intermediate developers who want to level up their skills through practice, not just theory. Our AI tutor adapts to your learning style and pace.`,
        shortDescription: 'Interactive coding education with AI-powered tutoring',
        categoryId: 'cat-3',
        category: getCategoryById('cat-3'),
        creatorId: 'user-2',
        creator: getUserById('user-2'),
        creatorProfile: getCreatorProfile('user-2'),
        thumbnail: 'https://picsum.photos/seed/learncode/800/600',
        screenshots: ['/api/placeholder/800/500', '/api/placeholder/800/500'],
        externalUrl: 'https://learncode.example.com',
        techStack: ['React', 'Node.js', 'Monaco Editor', 'Docker'],
        useCases: [
            'Self-paced coding education',
            'Company training programs',
            'Bootcamp curriculum enhancement',
        ],
        faq: [
            {
                question: 'What languages are supported?',
                answer: 'JavaScript, Python, TypeScript, Go, and Rust with more coming soon.',
            },
        ],
        // Pricing removed

        hasFreeTrial: true,
        freeTrialDetails: '3 free courses to try',
        rating: 4.7,
        reviewCount: 156,
        viewCount: 5680,
        clickCount: 2340,
        status: 'active',
        createdAt: '2025-06-10T08:00:00Z',
        updatedAt: '2025-12-22T08:00:00Z',
    },
    {
        id: 'web-5',
        name: 'BudgetWise',
        slug: 'budgetwise',
        description: `Personal finance management made simple. BudgetWise helps you track expenses, set budgets, and achieve your financial goals with beautiful visualizations and smart insights.

Connect your bank accounts securely or manually log expenses. Our AI categorizes transactions and provides actionable insights to help you save more.`,
        shortDescription: 'Smart personal finance tracking with AI insights',
        categoryId: 'cat-5',
        category: getCategoryById('cat-5'),
        creatorId: 'user-3',
        creator: getUserById('user-3'),
        creatorProfile: getCreatorProfile('user-3'),
        thumbnail: 'https://picsum.photos/seed/budgetwise/800/600',
        screenshots: ['/api/placeholder/800/500'],
        externalUrl: 'https://budgetwise.example.com',
        techStack: ['React Native', 'Expo', 'Plaid API', 'Firebase'],
        useCases: [
            'Personal expense tracking',
            'Household budget management',
            'Savings goal planning',
        ],
        faq: [
            {
                question: 'Is my banking data safe?',
                answer: 'We use Plaid for bank connections - the same security used by major fintech apps.',
            },
        ],
        // Pricing removed

        hasFreeTrial: true,
        freeTrialDetails: '30-day Premium trial',
        rating: 4.4,
        reviewCount: 89,
        viewCount: 4120,
        clickCount: 1567,
        status: 'active',
        createdAt: '2025-05-15T08:00:00Z',
        updatedAt: '2025-12-10T08:00:00Z',
    },
    {
        id: 'web-6',
        name: 'ContentBot AI',
        slug: 'contentbot-ai',
        description: `ContentBot AI is your AI writing assistant for creating blog posts, social media content, marketing copy, and more.

Powered by the latest language models, ContentBot helps you overcome writer's block and produce high-quality content 10x faster. Perfect for marketers, bloggers, and content creators.`,
        shortDescription: 'AI writing assistant for content creators',
        categoryId: 'cat-6',
        category: getCategoryById('cat-6'),
        creatorId: 'user-6',
        creator: getUserById('user-6'),
        creatorProfile: getCreatorProfile('user-6'),
        thumbnail: 'https://picsum.photos/seed/contentbot/800/600',
        screenshots: ['/api/placeholder/800/500', '/api/placeholder/800/500'],
        externalUrl: 'https://contentbot.example.com',
        techStack: ['Next.js', 'OpenAI GPT-4', 'Vercel', 'Stripe'],
        useCases: [
            'Blog post generation',
            'Social media content calendars',
            'Email marketing campaigns',
            'Product descriptions',
        ],
        faq: [
            {
                question: 'Is the content original?',
                answer: 'Yes, all content is generated uniquely for you. We also include a plagiarism checker.',
            },
        ],
        // Pricing removed

        hasFreeTrial: true,
        freeTrialDetails: '2,000 free words to try',
        rating: 4.6,
        reviewCount: 203,
        viewCount: 8920,
        clickCount: 4567,
        status: 'active',
        createdAt: '2025-04-01T08:00:00Z',
        updatedAt: '2025-12-25T08:00:00Z',
    },
    {
        id: 'web-7',
        name: 'MeetingMind',
        slug: 'meetingmind',
        description: `MeetingMind records, transcribes, and summarizes your meetings automatically. Never miss an action item again.

Our AI creates searchable transcripts, extracts key decisions and action items, and integrates with your calendar to join meetings automatically.`,
        shortDescription: 'AI meeting assistant that captures everything',
        categoryId: 'cat-1',
        category: getCategoryById('cat-1'),
        creatorId: 'user-6',
        creator: getUserById('user-6'),
        creatorProfile: getCreatorProfile('user-6'),
        thumbnail: 'https://picsum.photos/seed/meetingmind/800/600',
        screenshots: ['/api/placeholder/800/500'],
        externalUrl: 'https://meetingmind.example.com',
        techStack: ['Python', 'Whisper AI', 'React', 'AWS'],
        useCases: [
            'Remote team meetings',
            'Client calls documentation',
            'Interview recording',
        ],
        faq: [
            {
                question: 'Which meeting platforms are supported?',
                answer: 'Zoom, Google Meet, Microsoft Teams, and WebEx.',
            },
        ],
        // Pricing removed

        hasFreeTrial: true,
        freeTrialDetails: '5 free meeting transcriptions',
        rating: 4.7,
        reviewCount: 67,
        viewCount: 3200,
        clickCount: 890,
        status: 'active',
        createdAt: '2025-10-01T08:00:00Z',
        updatedAt: '2025-12-20T08:00:00Z',
    },
    {
        id: 'web-8',
        name: 'QuizMaster Pro',
        slug: 'quizmaster-pro',
        description: `Create engaging quizzes and assessments in minutes. Perfect for educators, trainers, and HR professionals.

QuizMaster Pro offers multiple question types, automatic grading, detailed analytics, and beautiful certificates. Export results or integrate with your LMS.`,
        shortDescription: 'Professional quiz and assessment platform',
        categoryId: 'cat-3',
        category: getCategoryById('cat-3'),
        creatorId: 'user-2',
        creator: getUserById('user-2'),
        creatorProfile: getCreatorProfile('user-2'),
        thumbnail: 'https://picsum.photos/seed/quizmaster/800/600',
        screenshots: ['/api/placeholder/800/500', '/api/placeholder/800/500'],
        externalUrl: 'https://quizmaster.example.com',
        techStack: ['Vue.js', 'Laravel', 'MySQL', 'Redis'],
        useCases: [
            'Student assessments',
            'Employee training quizzes',
            'Marketing lead generation quizzes',
        ],
        faq: [],
        // Pricing removed

        hasFreeTrial: false,
        rating: 4.3,
        reviewCount: 45,
        viewCount: 2100,
        clickCount: 560,
        status: 'active',
        createdAt: '2025-11-01T08:00:00Z',
        updatedAt: '2025-12-15T08:00:00Z',
    },
];

// ============================================
// REVIEWS
// ============================================

export const mockReviews: Review[] = [
    {
        id: 'review-1',
        websiteId: 'web-1',
        userId: 'user-1',
        user: getUserById('user-1'),
        rating: 5,
        title: 'Game changer for our legal team',
        content: 'DocuGen Pro has transformed how we create contracts. What used to take 2 hours now takes 15 minutes. The AI suggestions are incredibly accurate and the templates are professional.',
        createdAt: '2025-12-01T10:00:00Z',
        helpfulCount: 24,
    },
    {
        id: 'review-2',
        websiteId: 'web-1',
        userId: 'user-4',
        user: getUserById('user-4'),
        rating: 4,
        title: 'Great tool, minor learning curve',
        content: 'Excellent platform overall. Took a bit to understand all the features but customer support was helpful. Now I can\'t imagine working without it.',
        createdAt: '2025-11-28T14:00:00Z',
        helpfulCount: 12,
    },
    {
        id: 'review-3',
        websiteId: 'web-3',
        userId: 'user-1',
        user: getUserById('user-1'),
        rating: 5,
        title: 'Best invoicing tool I\'ve used',
        content: 'As a freelancer, this has saved me so much time. The AI understands exactly what I need and generates perfect invoices. Payment tracking is a nice bonus.',
        createdAt: '2025-12-10T09:00:00Z',
        helpfulCount: 31,
    },
    {
        id: 'review-4',
        websiteId: 'web-6',
        userId: 'user-4',
        user: getUserById('user-4'),
        rating: 5,
        title: 'Replaced our entire content team',
        content: 'Not literally, but ContentBot AI now handles first drafts for all our blog posts. The quality is impressive and it\'s only getting better.',
        createdAt: '2025-12-15T16:00:00Z',
        helpfulCount: 45,
    },
    {
        id: 'review-5',
        websiteId: 'web-4',
        userId: 'user-1',
        user: getUserById('user-1'),
        rating: 4,
        title: 'Great for learning JavaScript',
        content: 'The interactive exercises really help concepts stick. The AI tutor is patient and explains things well. Would love to see more advanced courses.',
        createdAt: '2025-11-20T11:00:00Z',
        helpfulCount: 18,
    },
];

// Purchases and Trials removed


// ============================================
// BOOKMARKS
// ============================================

export const mockBookmarks: Bookmark[] = [
    {
        id: 'bookmark-1',
        websiteId: 'web-2',
        website: mockWebsites.find(w => w.id === 'web-2')!,
        userId: 'user-1',
        createdAt: '2025-12-18T15:00:00Z',
    },
    {
        id: 'bookmark-2',
        websiteId: 'web-5',
        website: mockWebsites.find(w => w.id === 'web-5')!,
        userId: 'user-1',
        createdAt: '2025-12-19T10:00:00Z',
    },
    {
        id: 'bookmark-3',
        websiteId: 'web-7',
        website: mockWebsites.find(w => w.id === 'web-7')!,
        userId: 'user-1',
        createdAt: '2025-12-22T14:00:00Z',
    },
];

// ============================================
// MESSAGES
// ============================================

export const mockMessages: Message[] = [
    {
        id: 'msg-1',
        threadId: 'thread-1',
        senderId: 'user-1',
        sender: getUserById('user-1'),
        content: 'Hi Sarah, I had a question about the DocuGen Pro subscription. Do you offer annual billing?',
        isRead: true,
        createdAt: '2025-12-20T10:00:00Z',
    },
    {
        id: 'msg-2',
        threadId: 'thread-1',
        senderId: 'user-2',
        sender: getUserById('user-2'),
        content: 'Hi John! Yes, we do offer annual billing with a 20% discount. Would you like me to set that up for you?',
        isRead: true,
        createdAt: '2025-12-20T11:30:00Z',
    },
    {
        id: 'msg-3',
        threadId: 'thread-1',
        senderId: 'user-1',
        sender: getUserById('user-1'),
        content: 'That would be great, thank you!',
        isRead: false,
        createdAt: '2025-12-20T14:00:00Z',
    },
];

export const mockMessageThreads: MessageThread[] = [
    {
        id: 'thread-1',
        participants: [getUserById('user-1'), getUserById('user-2')],
        websiteId: 'web-1',
        website: mockWebsites.find(w => w.id === 'web-1'),
        lastMessage: mockMessages[2],
        unreadCount: 1,
        createdAt: '2025-12-20T10:00:00Z',
        updatedAt: '2025-12-20T14:00:00Z',
    },
];

// ============================================
// REPORTS
// ============================================

export const mockReports: Report[] = [
    {
        id: 'report-1',
        websiteId: 'web-8',
        website: mockWebsites.find(w => w.id === 'web-8')!,
        reporterId: 'user-4',
        reporter: getUserById('user-4'),
        reason: 'Misleading description',
        description: 'The website claims to have features that are not actually available.',
        status: 'pending',
        createdAt: '2025-12-26T09:00:00Z',
    },
];

// ============================================
// CREATOR APPLICATIONS
// ============================================

export const mockCreatorApplications: CreatorApplication[] = [
    {
        id: 'app-1',
        userId: 'user-4',
        user: getUserById('user-4'),
        bio: 'Experienced marketer with 5 years building automation tools.',
        professionalBackground: 'Marketing Automation Specialist',
        expertise: ['Marketing', 'Zapier', 'No-Code Tools'],
        portfolioUrl: 'https://emmawilson.io',
        motivation: 'I want to share my marketing automation tools with a wider audience.',
        status: 'pending',
        createdAt: '2025-12-27T10:00:00Z',
    },
];

// ============================================
// ADMIN STATS
// ============================================

export const mockPlatformStats: PlatformStats = {
    totalWebsites: 42,
    totalCreators: 15,
    totalBuyers: 350,
    pendingVerifications: 3,
    pendingReports: 0,
};

// ============================================
// CURRENT USER (FOR DEMO)
// ============================================

export const mockCurrentUser = mockUsers[0]; // John Buyer by default
