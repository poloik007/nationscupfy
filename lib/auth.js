'use client';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

export function getAdminEmail() {
  return process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';
}

export async function sendMagicLink(email) {
  const actionCodeSettings = {
    url: `${window.location.origin}/admin/login`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
}

export async function completeMagicLinkSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;
  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) {
    email = window.prompt('Please confirm your email address:');
  }
  if (!email) throw new Error('Email is required to complete sign-in.');
  const result = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem('emailForSignIn');
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function isAdminUser(user) {
  if (!user) return false;
  const adminEmail = getAdminEmail();
  return user.email === adminEmail;
}
