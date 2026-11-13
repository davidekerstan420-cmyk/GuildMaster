import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useStoredToggle(key: string, defaultValue = true) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((v) => {
        if (v !== null) setValue(v === '1');
      })
      .catch(() => {});
  }, [key]);

  const toggle = () => {
    setValue((prev) => {
      const next = !prev;
      AsyncStorage.setItem(key, next ? '1' : '0').catch(() => {});
      return next;
    });
  };

  return [value, toggle] as const;
}