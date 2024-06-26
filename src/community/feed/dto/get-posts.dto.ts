import { PostDto } from "./post.dto";

export class GetPostsDto {
  page: number;
  take: number;
  posts: PostDto[];
}
