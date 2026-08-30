export type ApiResponse<T = string> = {
  success: boolean;
  message: string;
  data: T;
};

export interface PublicArticle {
  id: string;
  title: string;
  dek: string;
  category: string;
  heroImage: string | null;
  publishedAt: string;
  author: { name: string };
  _count: { comments: number };
}

export interface PublicPostListResponse {
  posts: PublicArticle[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
}

export interface PublicArticleDetail {
  id: string;
  title: string;
  dek: string;
  category: string;
  heroImage: string | null;
  content: ContentBlock[];
  publishedAt: string | null;
  createdAt: string;
  author: { username: string };
  _count: { comments: number };
}




// blog/blockTypes.ts
export type HeadingBlock = { id: string; type: "heading"; text: string };
export type ParagraphBlock = { id: string; type: "paragraph"; text: string };
export type PullquoteBlock = { id: string; type: "pullquote"; quote: string; attribution?: string };
export type ImageBlock = { id: string; type: "image"; src: string; caption?: string };
export type ListicleBlock = {
  id: string;
  type: "listicle";
  number: number;
  title: string;
  description: string;
};

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | PullquoteBlock
  | ImageBlock
  | ListicleBlock;