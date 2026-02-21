'use client';

import { useState, useEffect, useCallback } from 'react';

export type EmojiPolicy = 'none' | 'keep_user_only' | 'allow_ai';

export interface Settings {
  emojiPolicy: EmojiPolicy;
}

const SETTINGS_KEY = 'messagecoach_settings';
const CURRENT_VERSION = 1;

interface SettingsStorage {
  settings: Settings;
  version: number;
}

const DEFAULT_SETTINGS: Settings = {
  emojiPolicy: 'keep_user_only', // デフォルト: ユーザーの絵文字のみ
};

function loadFromStorage(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const data: SettingsStorage = JSON.parse(raw);
    return data.settings || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveToStorage(settings: Settings): void {
  if (typeof window === 'undefined') return;

  const data: SettingsStorage = {
    settings,
    version: CURRENT_VERSION,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回ロード
  useEffect(() => {
    setSettings(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // 変更時に保存
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(settings);
    }
  }, [settings, isLoaded]);

  const updateEmojiPolicy = useCallback((policy: EmojiPolicy) => {
    setSettings((prev) => ({ ...prev, emojiPolicy: policy }));
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    settings,
    isLoaded,
    updateEmojiPolicy,
    updateSettings,
  };
}
