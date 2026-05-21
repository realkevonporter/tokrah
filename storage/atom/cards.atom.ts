import { Card } from "@/types/card.type";
import { atom } from "jotai";

export const cardsAtom = atom<Card[]>([]);

export const cardsStateAtom = atom<boolean>(true)
