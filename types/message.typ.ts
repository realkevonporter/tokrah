import { Media } from "./media.type";

export interface Message {
    id: string;
    text?: string;
    medias?: Media[];
    createdAt: string;
    senderId: string;
};