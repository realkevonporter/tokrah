import { Card } from "@/types/card.type";
import api from ".";
import { store } from "@/storage/atom/store";
import { genderAtom, maxAgeAtom, maxHeightAtom, minAgeAtom, minHeightAtom, radiusAtom } from "@/storage/atom/filter.atom";


export const getUsers = async (minAge: number = 18, maxAge: number = 99, gender: string = 'MALE', minHeight: number = 120, maxHeight: number = 180, coordinates: { latitude: number; longitude: number } = { latitude: 41.779197, longitude: -72.684300 }, radius: number = 100): Promise<Card[]> => {
    const res = await api.post<{ users: Card[] }>('/v1/users', {
        minAge,
        maxAge,
        gender,
        minHeight,
        maxHeight,
        coordinates,
        radius
    });

    console.log('Fetched users:', res.data.users);
    console.log(Array.isArray(res.data.users));
    console.log(typeof res.data.users);
    console.log(res.data.users);
    return res.data.users ?? [];
};

export const updateFilter = async (minAge: number = 18, maxAge: number = 99, gender: string = 'MALE', minHeight: number = 120, maxHeight: number = 180, radius: number = 100) => {
    const res = await api.post('/v1/match/filter', {
        minAge,
        maxAge,
        gender,
        minHeight,
        maxHeight,
        radius
    })
}

export const getFilter = async () => {
    try {
        const res = await api.get('v1/match/filter');

        const filter = res.data.filter

        store.set(minAgeAtom, filter.minAge);
        store.set(maxAgeAtom, filter.maxAge);
        store.set(minHeightAtom, filter.minHeight);
        store.set(maxHeightAtom, filter.maxHeight);
        store.set(genderAtom, filter.gender);
        store.set(radiusAtom, filter.radius);

    } catch (err) {

    }

}