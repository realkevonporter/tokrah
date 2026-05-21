import { Gender } from "@/enums/gender.enum";
import { Media } from "./media.type";
import { Address } from "./address.type";

export interface User {
    id?: string;
    username: string | null | undefined;
    name: string | null | undefined;
    gender: 'MALE' | 'FEMALE',
    bio?: string | null | undefined;
    email: string;
    height: number;
    birthdate: string | null | undefined;
    medias: Media[];
    address?: Address | null;
    verified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}