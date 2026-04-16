import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8091');

export const isLoggedIn = () => pb.authStore.isValid;
export const currentUser = () => pb.authStore.record;
export const authWithPassword = (email: string, password: string) =>
  pb.collection('users').authWithPassword(email, password);
export const logoutUser = () => pb.authStore.clear();

if (isLoggedIn()) pb.collection('users').authRefresh();
