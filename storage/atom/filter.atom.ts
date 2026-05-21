import { atom } from 'jotai'

export const minAgeAtom = atom(18)
export const maxAgeAtom = atom(60)

export const genderAtom = atom("FEMALE")
export const minHeightAtom = atom(40) // in inches
export const maxHeightAtom = atom(180) // in inches
export const radiusAtom = atom(100) // in miles