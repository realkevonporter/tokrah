import { Card } from "@/types/card.type";
import { atom } from "jotai";

export const matchUserAtom = atom<Card | null>(null);
export const matchIdAtom = atom<string>();