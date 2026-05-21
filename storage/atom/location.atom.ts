import * as Location from 'expo-location';
import { atom } from "jotai";

export const authLocationAtom = atom<Location.LocationObject>()