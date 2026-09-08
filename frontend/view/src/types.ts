export interface User {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  expertise?: string[];
  isFollowing?: boolean;
  networkCount?: number;
  email?: string;
}

export interface LinkPreview {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timeAgo: string;
}

export interface Post {
  id: string;
  author: User;
  timeAgo: string;
  content: string;
  image?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByMe?: boolean;
  linkPreview?: LinkPreview;
  comments?: Comment[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  postedTime: string;
  category: string;
  isApplied?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  otherUser: User;
  messages: ChatMessage[];
  unread?: boolean;
}
