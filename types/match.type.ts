import { Media } from "./media.type"

export interface Match {
    id: string;
    createdAt: Date;
    user: {
        id: string;
        username: string;
        medias: Media[];
        gender: 'MALE'|'FEMALE'
    }
    lastMessage: {
        id: string;
		text?: string,
		createdAt: string,
		senderId: string
    }
}

