import { AuthResponse } from '@/types/auth.type';
import api from '.';
import { deleteToken, getToken, saveToken } from '@/storage/securestore/auth.securestore';
import { store } from '@/storage/atom/store';
import { verifiedState } from '@/storage/atom/auth.atom';
import { ReferralVerificationResponse } from '@/types/referral.ype';


export const createReferral = async (): Promise<string | any> => {
  try {
    const res = await api.get('/v1/referral/');
    return res.data.referralToken;
  } catch (error) {
    console.error('Failed to create referral code:', error);
  }
};

export const verifyReferral = async (referralToken:string): Promise<ReferralVerificationResponse | any> => {
  try {
    const res = await api.post<ReferralVerificationResponse>('/v1/referral/verify', { referralToken });


    store.set(verifiedState, res.data.verified);
    
    return res.data;
  } catch (error) {
    // interceptor already shows toast
    console.error('Signup failed:', error);
  }
};