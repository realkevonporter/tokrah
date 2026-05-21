import { User } from '@/types/user.type'
import { atom } from 'jotai'

export const authState = atom(false)
export const verifiedState = atom(false)
export const authUserAtom = atom<User>()