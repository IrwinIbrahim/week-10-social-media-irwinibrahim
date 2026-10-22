export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  author: User;
}

export interface FeedPage {
  items: Post[];
  page: number;
  hasNext: boolean;
}

export interface Profile extends User {
  email: string;
  phone: string;
  bio: string;
  isFollowedByMe?: boolean;
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes: number;
  };
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: User;
}

export interface CommentsPage {
  items: Comment[];
  page: number;
  hasNext: boolean;
}
