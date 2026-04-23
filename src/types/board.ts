export type Reply = {
  id: string;
  ownerId: string;
  author: string;
  message: string;
  createdAt: string;
};

export type Board = {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  author: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  replies: Reply[];
};
