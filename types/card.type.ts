import { Media } from "./media.type";

export interface Card {
    id: string;
    username: string;
    bio: string;
    birthdate: string;
    gender: string,
    height: number;
    distance_meters: number;
    medias: Media[];
}