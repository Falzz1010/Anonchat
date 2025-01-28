export interface Message {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  tags: string[];
  likes: number;
  replies?: number;
}
