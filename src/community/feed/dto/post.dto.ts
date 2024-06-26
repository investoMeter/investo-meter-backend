export class PostDto {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string;
  authorId: string;
  likesCount: number;
  isLiked: boolean;
}
