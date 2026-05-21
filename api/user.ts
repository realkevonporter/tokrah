import api from ".";

export const updateLocation = async (coordinates: { latitude: number; longitude: number }) => {
    const res = await api.patch('/v1/users/me', { coordinates });
    return res.data;
};