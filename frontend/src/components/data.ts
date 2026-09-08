import { User, Post, Job, Conversation } from './types';

export const mockUsers: Record<string, User> = {
  adrian: {
    id: 'adrian',
    name: 'Adrian Sterling',
    title: 'Principal Product Designer',
    company: 'Connect Modern',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-QM2JtyfUyYiuqm_PRlrlsr5Jbw27FIGuCnEK5cnE6RzVEQ4P3OLYiqYKt65nOGwg4iGWsb7I4XcQ86YKh2WJIcHseZ_AmEfMQDr0NTluSMBB8yOayYZNtG82IXZrszDIwlP87YuUGDdguDcpXzFJtmMXWT2Ggnoea9OQjzBRR54ozFaEiplRnlu9EBFUHW_ZISuRN7FxhII5MnUSwLjeLjgcNq3wS7TGaS28wsZe54oGUZ45XklIo7-6qu-qotZZf0bgOfWIlb4',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNRe7599PvPWjme4G1AfCuqcb7I6UtEfFvUtdGPnRFJECAdNMFPb1kcrd9KwQ_87mYgQbHbQ2ctj_ZHqmtJb_doWqfMrutKHzE7NQNjLUInqnZIHZ4XTX8S7sOChktBxP-tn-PkdoXLSH-k4ukJZ4jLc_2aqQjsALi4S_HCg7wMsqDjgVxO13OFWIvo9OuSY2Qsru3E1aCOcXRmRjxobRIn1NFEHlFaK23OQ43zvup3-6gZZfNtg6PyGcHnDft9Db2izkVaYVWIaQ',
    bio: 'Passionate about building design systems that bridge the gap between engineering and aesthetics. 10+ years of experience in leading multi-disciplinary creative teams for global tech brands.',
    location: 'San Francisco, CA',
    website: 'adriansterling.design',
    joinedDate: 'Joined January 2018',
    expertise: ['System Design', 'Prototyping', 'User Research', 'Strategy', 'Web3', 'Interface Motion'],
    networkCount: 1420,
    email: 'adrian@connectmodern.com'
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah Chen',
    title: 'Director of Engineering',
    company: 'CloudScale',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnwasLonkl65aqS1BSliBHMmL7bL-QV8V3Klns2NtVzCi9N2uTVdK-qMvslBLu82IL6vkXb95sh3GY8zddzVHlVAY4_aKMa-ZeSKC7mIIBV2Wqo__tWRHf9h_-SR9EJccTob9dQXsPOuVxQIGtN8BC3kbgX5NtNmEFsMVTiDg-AuamUgtq86WNxmcrgtf83HOmrGtiGd_2X3oU2ZLkGgIQ95QH65bPslsgi5eryTsko87R-hSo2N_Xz7VxPhvA_hPuZHlZAaXKW8c',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNRe7599PvPWjme4G1AfCuqcb7I6UtEfFvUtdGPnRFJECAdNMFPb1kcrd9KwQ_87mYgQbHbQ2ctj_ZHqmtJb_doWqfMrutKHzE7NQNjLUInqnZIHZ4XTX8S7sOChktBxP-tn-PkdoXLSH-k4ukJZ4jLc_2aqQjsALi4S_HCg7wMsqDjgVxO13OFWIvo9OuSY2Qsru3E1aCOcXRmRjxobRIn1NFEHlFaK23OQ43zvup3-6gZZfNtg6PyGcHnDft9Db2izkVaYVWIaQ',
    bio: 'Building hyper-scalable distributed datastores and serverless architectures. Advocate of Rust, Go, and high efficiency team building.',
    location: 'Seattle, WA',
    website: 'sarahchen.io',
    joinedDate: 'Joined March 2019',
    expertise: ['Distributed Systems', 'Rust', 'Cloud Infrastructure', 'Kubernetes', 'Scalability'],
    networkCount: 2310,
    email: 'sarah.chen@cloudscale.com'
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus Holloway',
    title: 'Chief Strategy Officer',
    company: 'StrategyInsights',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvcd5bGYnbFUZ7YtQ3FLVHDwGTj5Cy8kaSNDRHNysfmKbWcl-zEJxBZ73mhLhs-VehP5q5ZORZXzjw9r1zuIeZijsqbMM6SDOniOb7zHleG4VYC0qmEXSl91l8EwVg0023YkUzIBRxVTo3CT0Cal4TjAYmpmadytlltDZOwobBrIZQJXST6nzrXDdB1z_ErFrG39oH_D3k40UsEIaKDHNKe7HhVvy0A-zvhEAhxYn-SstPZpvOZYi05-Wkj63tSFyyrFYui0YnqwI',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNRe7599PvPWjme4G1AfCuqcb7I6UtEfFvUtdGPnRFJECAdNMFPb1kcrd9KwQ_87mYgQbHbQ2ctj_ZHqmtJb_doWqfMrutKHzE7NQNjLUInqnZIHZ4XTX8S7sOChktBxP-tn-PkdoXLSH-k4ukJZ4jLc_2aqQjsALi4S_HCg7wMsqDjgVxO13OFWIvo9OuSY2Qsru3E1aCOcXRmRjxobRIn1NFEHlFaK23OQ43zvup3-6gZZfNtg6PyGcHnDft9Db2izkVaYVWIaQ',
    bio: 'Analyzing market trends and digital-first disruptions since 2010. Former principal consultant with McKinsey & Company.',
    location: 'New York, NY',
    website: 'strategyinsights.com',
    joinedDate: 'Joined September 2017',
    expertise: ['Growth Strategy', 'Market Analysis', 'M&A', 'Enterprise Architecture'],
    networkCount: 4500,
    email: 'marcus@strategyinsights.com'
  },
  elena: {
    id: 'elena',
    name: 'Elena Rodriguez',
    title: 'Growth Marketing Lead',
    company: 'TechStream',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAn4yY9AHfgHf5xSDNmE2A_L8DgJV3uWazYrzWuZumv1lrZwSzNTy_txsCyzyjHJwa_RCAMj3-jpkiZDeAQejuQH9-SfGrYGVO20mpRl9bH2mMrmj1j1KJLx1lePrt_iaSi4pehX40r--N232fR7mpquvoZPcdW3BdBpeOcPekx3tLOUzgfyNN9gqcMYpExpiZ5hm73m_hcAslYaQYwfuIKQNchDQ9O-Uor4rYDfKDlVewLOW3KacaJhso7-C43V3Jjrt76AqC1I8',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNRe7599PvPWjme4G1AfCuqcb7I6UtEfFvUtdGPnRFJECAdNMFPb1kcrd9KwQ_87mYgQbHbQ2ctj_ZHqmtJb_doWqfMrutKHzE7NQNjLUInqnZIHZ4XTX8S7sOChktBxP-tn-PkdoXLSH-k4ukJZ4jLc_2aqQjsALi4S_HCg7wMsqDjgVxO13OFWIvo9OuSY2Qsru3E1aCOcXRmRjxobRIn1NFEHlFaK23OQ43zvup3-6gZZfNtg6PyGcHnDft9Db2izkVaYVWIaQ',
    bio: 'Driving exponential CAC efficiency and product-led growth systems. Passionate about creative branding and conversion optimization.',
    location: 'Los Angeles, CA',
    website: 'techstream.co/elena',
    joinedDate: 'Joined June 2020',
    expertise: ['Growth Hacking', 'Paid Acquisition', 'PLG', 'Content Strategy'],
    networkCount: 890,
    email: 'elena.r@techstream.com'
  },
  david: {
    id: 'david',
    name: 'David Kim',
    title: 'Cloud Architect',
    company: 'NetSystems',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCedLssi65pkFtXaIA57YXi66Ok0ZGTRYJd7g98hae6DomlVgcljphZ0b_E0rgP2rTJgvEwD6wLrbFO2TiTN7zvI2H027q3GyneqDLexQlHDddxmqrtJG5sknAbg-ZR4zvrdXMcehkDHSekt5HsDLsoYJ3-kYn7qdA7cIVsExv6B7PxdG0NakMRJZO91vjo1zSzOTUowZWgC-y-_jYPVqYlNNI-J6J3J-7jvoGXGgBJti14Nbdp-fxGbxN1lxFuExwFDoQOCV2IICA',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNRe7599PvPWjme4G1AfCuqcb7I6UtEfFvUtdGPnRFJECAdNMFPb1kcrd9KwQ_87mYgQbHbQ2ctj_ZHqmtJb_doWqfMrutKHzE7NQNjLUInqnZIHZ4XTX8S7sOChktBxP-tn-PkdoXLSH-k4ukJZ4jLc_2aqQjsALi4S_HCg7wMsqDjgVxO13OFWIvo9OuSY2Qsru3E1aCOcXRmRjxobRIn1NFEHlFaK23OQ43zvup3-6gZZfNtg6PyGcHnDft9Db2izkVaYVWIaQ',
    bio: 'Designing hybrid multi-cloud systems with rigorous fallback mechanisms. Google Cloud Certified Professional.',
    location: 'Austin, TX',
    website: 'netsystems.net/david',
    joinedDate: 'Joined November 2021',
    expertise: ['Multi-Cloud', 'GCP', 'SecOps', 'Data Engineering'],
    networkCount: 1100,
    email: 'd.kim@netsystems.com'
  }
};

export const initialPosts: Post[] = [
  {
    id: 'post_1',
    author: mockUsers.sarah,
    timeAgo: '2 hours ago',
    content: "Excited to announce our latest breakthrough in distributed systems efficiency. We've managed to reduce latency by 40% while maintaining absolute consistency. Proud of the team for pushing the boundaries of what's possible in cloud infrastructure! 🚀",
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7prdOqFad0jXwnstK80LnblExFmQ5ge8ZOEV7G8YsUo00CGRzeO9oGpCt-bUD8pMVsxWtVf_CePmWg_Jtu3dOZ281-Z4wjzZtj1kxppnXyWc4eeBoH5oFnH5myoioLppa922GyMhfwa7Aj6-ILD_vuzy76w51OZL-jHuD9YCGzUCGgvm3zEfsYt_8YRKKIz-Odskuc8KolqHa8rBxH6_XcduKpoAHdu4CGvLTRCwlp8NYtgJfi48ML7k0Pqeb4I_a5fWZSzevMmU',
    likesCount: 1240,
    commentsCount: 48,
    sharesCount: 12,
    isLikedByMe: false,
    comments: [
      {
        id: 'c1',
        authorName: 'Adrian Sterling',
        authorAvatar: mockUsers.adrian.avatar,
        content: 'This is huge! The UI integrations are responding so much faster now.',
        timeAgo: '1h ago'
      },
      {
        id: 'c2',
        authorName: 'David Kim',
        authorAvatar: mockUsers.david.avatar,
        content: 'Impressive work, Sarah. Let’s do a sync on how this impacts our multi-cloud deployment specs.',
        timeAgo: '30m ago'
      }
    ]
  },
  {
    id: 'post_2',
    author: mockUsers.adrian,
    timeAgo: '2 hours ago',
    content: "Really excited to announce the launch of our new Design Token system! We've managed to reduce our CSS bundle size by 40% while increasing visual consistency across all platforms. Check out the documentation below.",
    likesCount: 1200,
    commentsCount: 48,
    sharesCount: 15,
    isLikedByMe: false,
    linkPreview: {
      url: 'docs.connectmodern.com',
      title: 'The Modern Token System — Unified Branding',
      description: 'Unified designer-to-developer tokens mapping color palettes, font weights, scale rules, and elevations seamlessly.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPkY786iNyzU66CJd4gB1KdM0O58nVe4E7wEyibO5DhiYflHC9zNvemSZMuEavfqqUGnWdB6CSOecH5PQ-_aCHyAge79m8jcU9wvfE2lT4JxqfUPAL2OaXeza6hp75_JhrwBwk06Euw-nh4_r3mM41NfGl1M5xQsDY4QF4XuxI_YYQbJS4NKELsB586QTDWGPyKz6Y3UQttMh-P_AmFp9pcJnizr_NkKaB-7c1lajOpRAzaheVvwr2zxj66QM5B6LTPAM4yxGtScM'
    },
    comments: [
      {
        id: 'c3',
        authorName: 'Elena Rodriguez',
        authorAvatar: mockUsers.elena.avatar,
        content: 'This has drastically improved our landing page build timing. Branding alignment is flawless now!',
        timeAgo: '1h ago'
      }
    ]
  },
  {
    id: 'post_3',
    author: mockUsers.marcus,
    timeAgo: '5 hours ago',
    content: 'The landscape of professional networking is changing. Efficiency and clarity are now the primary drivers of growth. Here is my latest analysis on the "Minimalist Professionalism" trend.',
    likesCount: 890,
    commentsCount: 34,
    sharesCount: 8,
    isLikedByMe: false,
    linkPreview: {
      url: 'strategyinsights.com',
      title: 'Future-Proofing Your Career in a Saturated Market',
      description: 'Discover the 5 pillars of digital presence for the modern professional age.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoS8EDSDgfpPEkMCtCAHQt7FR9iawer32ZQqkXl4gHvhSSmgpEvNslNtxI-8ei_rNbgH1khGcGNimFyYId5wJ5jezTL13Rq88GlhPRowef1cLfULS84QSkosK0xsq0HDWmWPG-af02SkL7PE2XDigxpO_vOv2UJcx7sY3f3dTVRnYzL8wPGVBfEDrRwOZbmT44ZezcSuUGXP-ieInMH0OdSWYmdqIbJwJa6z0lykpcc5JjiCtZ3rF935YDPgMoxZsWOJB1-OWWU8Q'
    },
    comments: []
  }
];

export const mockJobs: Job[] = [
  {
    id: 'job_1',
    title: 'Senior Product Designer',
    company: 'Connect Modern',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-QM2JtyfUyYiuqm_PRlrlsr5Jbw27FIGuCnEK5cnE6RzVEQ4P3OLYiqYKt65nOGwg4iGWsb7I4XcQ86YKh2WJIcHseZ_AmEfMQDr0NTluSMBB8yOayYZNtG82IXZrszDIwlP87YuUGDdguDcpXzFJtmMXWT2Ggnoea9OQjzBRR54ozFaEiplRnlu9EBFUHW_ZISuRN7FxhII5MnUSwLjeLjgcNq3wS7TGaS28wsZe54oGUZ45XklIo7-6qu-qotZZf0bgOfWIlb4',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$140k – $180k',
    type: 'Full-time',
    description: 'We are seeking an outstanding Senior Product Designer to join our core Professional Suite workspace group. You will champion clean layouts, spacious typography pairings, and robust design language systems.',
    postedTime: '1 day ago',
    category: 'Digital Design'
  },
  {
    id: 'job_2',
    title: 'Lead Distributed Systems Engineer',
    company: 'CloudScale',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnwasLonkl65aqS1BSliBHMmL7bL-QV8V3Klns2NtVzCi9N2uTVdK-qMvslBLu82IL6vkXb95sh3GY8zddzVHlVAY4_aKMa-ZeSKC7mIIBV2Wqo__tWRHf9h_-SR9EJccTob9dQXsPOuVxQIGtN8BC3kbgX5NtNmEFsMVTiDg-AuamUgtq86WNxmcrgtf83HOmrGtiGd_2X3oU2ZLkGgIQ95QH65bPslsgi5eryTsko87R-hSo2N_Xz7VxPhvA_hPuZHlZAaXKW8c',
    location: 'Seattle, WA (Remote Friendly)',
    salary: '$170k – $220k',
    type: 'Full-time',
    description: 'Looking for a technical hero in high throughput, low latency distributed databases. Rust/Go ecosystem background preferred.',
    postedTime: '3 days ago',
    category: 'Software Engineering'
  },
  {
    id: 'job_3',
    title: 'Growth Marketing Executive',
    company: 'TechStream',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAn4yY9AHfgHf5xSDNmE2A_L8DgJV3uWazYrzWuZumv1lrZwSzNTy_txsCyzyjHJwa_RCAMj3-jpkiZDeAQejuQH9-SfGrYGVO20mpRl9bH2mMrmj1j1KJLx1lePrt_iaSi4pehX40r--N232fR7mpquvoZPcdW3BdBpeOcPekx3tLOUzgfyNN9gqcMYpExpiZ5hm73m_hcAslYaQYwfuIKQNchDQ9O-Uor4rYDfKDlVewLOW3KacaJhso7-C43V3Jjrt76AqC1I8',
    location: 'Los Angeles, CA (Onsite)',
    salary: '$110k – $150k',
    type: 'Full-time',
    description: 'Lead multivariable conversion optimization, custom campaigns, and build strong strategic alliances with international tech partners.',
    postedTime: '5 days ago',
    category: 'Marketing & Strategy'
  }
];

export const initialConversations: (currentUserId: string) => Conversation[] = (currentUserId) => {
  return [
    {
      otherUser: mockUsers.sarah,
      messages: [
        {
          id: 'm1',
          senderId: 'sarah',
          receiverId: currentUserId,
          content: 'Hey Adrian! Did you review the visual outputs of our database telemetry design?',
          timestamp: '11:20 AM'
        },
        {
          id: 'm2',
          senderId: currentUserId,
          receiverId: 'sarah',
          content: 'Yes! Let me make sure we utilize Inter throughout the status indicators so it looks clean.',
          timestamp: '11:24 AM'
        },
        {
          id: 'm3',
          senderId: 'sarah',
          receiverId: currentUserId,
          content: 'Perfect, let me know when the tokens are ready and I can bind them in production.',
          timestamp: '11:30 AM'
        }
      ],
      unread: true
    },
    {
      otherUser: mockUsers.elena,
      messages: [
        {
          id: 'm4',
          senderId: 'elena',
          receiverId: currentUserId,
          content: 'Hi Adrian! Our growth numbers are soaring since we rolled out the minimalist redesign. Beautiful work!',
          timestamp: 'Yesterday'
        }
      ]
    },
    {
      otherUser: mockUsers.david,
      messages: []
    }
  ];
};
