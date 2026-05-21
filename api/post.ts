import { Media } from "@/types/media.type";
import api from ".";

export const makePost = async (text: string, feedType: string = 'PUBLIC') => {
    try {
        const res = await api.post('/v1/post/', {
            text,
            feedType
        })

        return res.data

    } catch (error) {
        console.log(error)
    }
}

export const getPosts = async (
  feedType: string,
  cursor: string
) => {
  const res = await api.post("/v1/post/feed", {
      feedType,
      cursor,
      limit: 8,
  });

  return res.data;
};