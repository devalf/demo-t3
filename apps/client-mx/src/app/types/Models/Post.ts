export type PostID = number;

export type Post = {
  id: PostID;
  title: string;
  body: string;
  userId: number;
};
