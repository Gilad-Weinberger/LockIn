// Homepage Data - All static content for homepage components

// Environment variables for Lemon Squeezy variant IDs
const PRO_MONTHLY_VARIANT_ID =
  process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID;
const PRO_YEARLY_VARIANT_ID =
  process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID;

export const testimonials = [
  {
    name: "Michael Chen",
    role: "Product Manager",
    company: "TechFlow Inc.",
    image: "MC",
    content:
      "As a developer with multiple projects, LockIn's AI scheduling has been life-changing. It transformed my chaotic task list into a perfectly organized calendar in seconds. The intelligent prioritization actually understands the importance of my work.",
    rating: 5,
    color: "from-blue-400 to-blue-500",
  },
  {
    name: "Jessica Williams",
    role: "Marketing Director",
    company: "Growth Labs",
    image: "JW",
    content:
      "LockIn is a game-changer for time management. The AI rules feature lets me set custom preferences, and everything gets scheduled automatically. My team productivity has increased by 40% since we started using it.",
    rating: 5,
    color: "from-green-400 to-green-500",
  },
  {
    name: "David Rodriguez",
    role: "Freelance Designer",
    company: "Creative Studio",
    image: "DR",
    content:
      "The natural language processing blew my mind. I just type 'Design logo for client by Friday' and it automatically schedules time blocks. The calendar integration is seamless.",
    rating: 5,
    color: "from-purple-400 to-purple-500",
  },
  {
    name: "Sarah Johnson",
    role: "Startup Founder",
    company: "InnovateTech",
    image: "SJ",
    content:
      "Managing a startup is chaos, but LockIn brings order. The AI prioritization using the Eisenhower Matrix helps me focus on what truly matters. It's like having a personal assistant that never sleeps.",
    rating: 5,
    color: "from-pink-400 to-pink-500",
  },
  {
    name: "Alex Thompson",
    role: "Operations Manager",
    company: "LogisticsPro",
    image: "AT",
    content:
      "The custom AI rules feature is incredible. I set my preferences once, and now all my tasks get scheduled perfectly around my meetings and deadlines. It saves me 2 hours of planning every day.",
    rating: 5,
    color: "from-indigo-400 to-indigo-500",
  },
  {
    name: "Emily Park",
    role: "Consultant",
    company: "Strategy Solutions",
    image: "EP",
    content:
      "LockIn's AI scheduling is phenomenal. It understands context and priority better than any tool I've used. The interface is beautiful and the automation is flawless. Highly recommend!",
    rating: 5,
    color: "from-orange-400 to-orange-500",
  },
  {
    name: "Robert Kim",
    role: "Software Engineer",
    company: "DevCorp",
    image: "RK",
    content:
      "Finally, a tool that actually understands developer workflows! LockIn schedules my coding sessions during my peak focus hours and automatically blocks time for code reviews. Pure genius.",
    rating: 5,
    color: "from-cyan-400 to-cyan-500",
  },
  {
    name: "Maria Garcia",
    role: "Project Manager",
    company: "BuildTech",
    image: "MG",
    content:
      "Managing multiple projects was overwhelming until I found LockIn. The AI automatically balances my workload and ensures nothing falls through the cracks. My stress levels have dropped significantly.",
    rating: 5,
    color: "from-teal-400 to-teal-500",
  },
  {
    name: "James Wilson",
    role: "Sales Director",
    company: "SalesForce Pro",
    image: "JW",
    content:
      "LockIn revolutionized my sales process. It schedules follow-ups, prioritizes hot leads, and blocks time for prospecting. My conversion rate increased by 35% in just two months.",
    rating: 5,
    color: "from-red-400 to-red-500",
  },
  {
    name: "Lisa Chang",
    role: "UX Designer",
    company: "DesignHub",
    image: "LC",
    content:
      "The AI understands creative workflows perfectly. It schedules design sprints when I'm most creative and automatically blocks buffer time for iterations. My design quality has improved dramatically.",
    rating: 5,
    color: "from-violet-400 to-violet-500",
  },
  {
    name: "Kevin Brown",
    role: "Financial Analyst",
    company: "FinanceFirst",
    image: "KB",
    content:
      "LockIn's scheduling intelligence is remarkable. It automatically schedules my analysis work during market hours and blocks time for report writing when markets are closed. Brilliant!",
    rating: 5,
    color: "from-emerald-400 to-emerald-500",
  },
  {
    name: "Amanda Davis",
    role: "HR Manager",
    company: "PeopleFirst",
    image: "AD",
    content:
      "Coordinating interviews and meetings was a nightmare before LockIn. Now the AI handles all the scheduling conflicts and finds optimal times for everyone. It's like having a super-powered assistant.",
    rating: 5,
    color: "from-rose-400 to-rose-500",
  },
  {
    name: "Daniel Lee",
    role: "Content Creator",
    company: "MediaWorks",
    image: "DL",
    content:
      "LockIn understands my creative energy patterns. It schedules content creation during my peak hours and batches similar tasks together. My content output has doubled while working fewer hours.",
    rating: 5,
    color: "from-amber-400 to-amber-500",
  },
  {
    name: "Rachel Green",
    role: "Research Scientist",
    company: "BioLab Inc.",
    image: "RG",
    content:
      "The AI perfectly balances my research time with administrative tasks. It even schedules lab work around equipment availability. LockIn has made my research process incredibly efficient.",
    rating: 5,
    color: "from-lime-400 to-lime-500",
  },
  {
    name: "Thomas Anderson",
    role: "CEO",
    company: "StartupVenture",
    image: "TA",
    content:
      "As a CEO, my time is precious. LockIn's AI scheduling ensures I'm always working on the highest-impact activities. It's transformed how I run my company and make strategic decisions.",
    rating: 5,
    color: "from-sky-400 to-sky-500",
  },
  {
    name: "Nicole Martinez",
    role: "Marketing Specialist",
    company: "BrandBoost",
    image: "NM",
    content:
      "LockIn's campaign scheduling is incredible. It automatically plans content creation, review cycles, and launch dates. Our marketing campaigns are now perfectly timed and executed.",
    rating: 5,
    color: "from-fuchsia-400 to-fuchsia-500",
  },
  {
    name: "Christopher Taylor",
    role: "Data Analyst",
    company: "DataInsights",
    image: "CT",
    content:
      "The AI understands data workflows perfectly. It schedules data collection during off-peak hours and analysis during my most focused times. My insights are more accurate and timely.",
    rating: 5,
    color: "from-slate-400 to-slate-500",
  },
  {
    name: "Stephanie White",
    role: "Event Coordinator",
    company: "EventPro",
    image: "SW",
    content:
      "Planning events involves countless moving parts. LockIn's AI coordinates everything seamlessly - vendor meetings, venue visits, and planning sessions. Every event runs like clockwork now.",
    rating: 5,
    color: "from-zinc-400 to-zinc-500",
  },
  {
    name: "Marcus Johnson",
    role: "Legal Counsel",
    company: "LawFirm Partners",
    image: "MJ",
    content:
      "LockIn revolutionized my legal practice. It schedules case research, client meetings, and court appearances optimally. I can handle 30% more cases while maintaining quality.",
    rating: 5,
    color: "from-stone-400 to-stone-500",
  },
  {
    name: "Jennifer Adams",
    role: "Product Designer",
    company: "DesignCo",
    image: "JA",
    content:
      "The AI scheduling respects my design process completely. It blocks uninterrupted time for deep work and schedules feedback sessions at optimal times. My designs have never been better.",
    rating: 5,
    color: "from-neutral-400 to-neutral-500",
  },
];

export const howItWorksSteps = [
  {
    step: 1,
    title: "Add Your Tasks",
    description:
      "Simply type or paste your tasks in natural language. No complex formatting needed - just write what you need to do.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    examples: [
      "Write report for client",
      "Call dentist tomorrow",
      "Grocery shopping this weekend",
    ],
  },
  {
    step: 2,
    title: "AI Prioritizes",
    description:
      "Our intelligent AI analyzes your tasks using the Eisenhower Matrix, automatically categorizing them by urgency and importance.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    examples: [
      "Write report - Do",
      "Call dentist - Do",
      "Grocery shopping - Plan",
    ],
  },
  {
    step: 3,
    title: "Smart Scheduling",
    description:
      "Tasks are automatically scheduled in your calendar based on priority, deadlines, and your available time slots. Done in seconds!",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    examples: [
      "9:00 AM - Write report",
      "2:00 PM - Call dentist",
      "Saturday - Grocery shopping",
    ],
  },
];

export const features = [
  {
    title: "Intelligent Task Prioritization",
    description:
      "Using the Eisenhower Matrix, our AI automatically categorizes tasks by urgency and importance for optimal productivity.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    color: "bg-green-500",
    lightColor: "bg-green-50",
    textColor: "text-green-600",
  },
  {
    title: "Smart Scheduling",
    description:
      "AI analyzes your tasks and automatically schedules them based on priority, deadlines, and your available time slots.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    title: "Custom AI Rules",
    description:
      "Set personalized rules and preferences for how AI should handle your tasks, deadlines, and scheduling patterns.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for getting started with AI task scheduling",
    monthlyPrice: 0,
    annualPrice: 0,
    variantId: null, // Free plan doesn't need checkout
    features: [
      "Up to 25 AI-processed tasks per month",
      "Basic Eisenhower Matrix prioritization",
      "Basic task scheduling",
      "Eisenhower Matrix visualization",
      "Basic calendar view & task organization",
    ],
    limitations: [
      "Monthly task processing limit",
      "Limited AI-powered scheduling",
      "Basic prioritization only",
      "No 3rd party calendar integrations",
    ],
    isPopular: false,
    color: "border-gray-200",
    buttonColor: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    textColor: "text-gray-600",
  },
  {
    name: "Professional",
    description: "Complete AI-powered productivity solution for professionals",
    monthlyPrice: 12,
    annualPrice: 120,
    monthlyVariantId: PRO_MONTHLY_VARIANT_ID,
    annualVariantId: PRO_YEARLY_VARIANT_ID,
    features: [
      "Unlimited AI-processed tasks",
      "Advanced AI-powered scheduling",
      "Advanced Eisenhower Matrix prioritization",
      "Full Google Calendar integration",
      "Custom AI rules & scheduling preferences",
      "Time blocking optimization",
      "Advanced calendar optimization algorithms",
      "Early access to new features",
    ],
    limitations: [],
    isPopular: true,
    color: "border-blue-500",
    buttonColor:
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
    textColor: "text-blue-600",
  },
];

export const faqData = [
  {
    question: "Can I switch between plans?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences.",
  },
  {
    question: "How does this AI scheduling work?",
    answer:
      "Our AI analyzes your tasks using natural language processing, categorizes them using the Eisenhower Matrix (urgent vs important), and automatically schedules them based on your preferences, deadlines, and available time slots. It learns from your patterns to improve over time.",
  },
  {
    question: "Can I set custom AI rules for my workflow?",
    answer:
      "Yes! In the Pro plan, you can set custom AI rules like 'Schedule creative work in the morning', 'Never schedule meetings after 5 PM', or 'Prioritize client work on weekdays'. The AI will follow these rules when scheduling your tasks.",
  },
];

export const statsData = [
  {
    value: "2,500+",
    rawValue: 2543, // Actual user count - update this with real data
    label: "Happy Users",
  },
  {
    value: "50,000+",
    label: "Tasks Scheduled",
  },
  {
    value: "4.9/5",
    label: "Average Rating",
  },
  {
    value: "40%",
    label: "Productivity Increase",
  },
];

export const navigationLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "Q&A" },
];

export const footerLinks = {
  product: [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "Q&A" },
  ],
};

export const socialLinks = [
  {
    name: "Twitter",
    href: "https://twitter.com/GiladCode",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/gilad-weinberger/",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/Gilad-Weinberger",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];
