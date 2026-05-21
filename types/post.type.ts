//import { Media } from "./media.type";
//import { User } from "./user.type";

export interface Post {
  id: string;
  text?: string;
  medias?: Media[];
  feeling?: "sad" | "happy" | "lonely" | "stressed" | "optimistic" | "weird";
  author: Author;
  createdAt: string;
  likes?: number;
  liked?: boolean;
  comments?: number;
}

interface Author {
  id: string;
  username: string;
  gender: string;
  medias?: Media[];
}

interface Media {
  type: string;
  url: string;
}