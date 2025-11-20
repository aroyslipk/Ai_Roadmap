'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useProfilePhoto() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [photoURL, setPhotoURL] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const loadPhoto = async () => {
      // 1. Try localStorage first (fastest)
      const localPhoto = localStorage.getItem(`profile_photo_${user.uid}`);
      if (localPhoto) {
        setPhotoURL(localPhoto);
        return;
      }

      // 2. Try Firestore (persists across devices)
      if (firestore) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().photoURL) {
            const firestorePhoto = userDoc.data().photoURL;
            setPhotoURL(firestorePhoto);
            // Save to localStorage for faster future loads
            localStorage.setItem(`profile_photo_${user.uid}`, firestorePhoto);
            return;
          }
        } catch (error) {
          console.warn('Could not load photo from Firestore:', error);
        }
      }

      // 3. Fallback to Firebase Auth photoURL
      if (user.photoURL) {
        setPhotoURL(user.photoURL);
        return;
      }

      // 4. Generate default avatar
      setPhotoURL(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email?.split('@')[0] || 'User')}&size=200&background=random`);
    };

    loadPhoto();

    // Listen for custom event when photo is updated in profile page
    const handlePhotoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setPhotoURL(customEvent.detail);
      }
    };

    window.addEventListener('profilePhotoUpdated', handlePhotoUpdate);
    return () => window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate);
  }, [user, firestore]);

  return photoURL;
}
