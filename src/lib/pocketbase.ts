import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090');

export const isLoggedIn = () => pb.authStore.isValid;
export const currentUser = () => pb.authStore.record;
