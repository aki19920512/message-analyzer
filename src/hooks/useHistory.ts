'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry, HistoryStorage } from '@/types/history';
import type { AnalysisResult } from '@/types/analysis';

const STORAGE_KEY = 'messagecoach_history';
const MAX_ENTRIES = 50;
const CURRENT_VERSION = 1;

function loadFromStorage(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const data: HistoryStorage = JSON.parse(raw);
    return data.entries || [];
  } catch {
    return [];
  }
}

function saveToStorage(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;

  const data: HistoryStorage = {
    entries,
    version: CURRENT_VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回ロード
  useEffect(() => {
    setEntries(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // 変更時に保存
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(entries);
    }
  }, [entries, isLoaded]);

  const addEntry = useCallback((
    result: AnalysisResult,
    meta: {
      partnerId?: string;
      partnerName: string;
      draft: string;
      goal: string;
    }
  ): string => {
    const id = crypto.randomUUID();
    const newEntry: HistoryEntry = {
      id,
      partnerId: meta.partnerId,
      partnerName: meta.partnerName,
      createdAt: new Date().toISOString(),
      draft: meta.draft,
      goal: meta.goal,
      scores: result.scores,
      reasons: result.reasons,
      suggestions: result.suggestions,
      nextStep: result.nextStep,
      isFavorite: false,
    };

    setEntries(prev => {
      const updated = [newEntry, ...prev];
      // 最大件数を超えたら古いものから削除（お気に入り以外）
      if (updated.length > MAX_ENTRIES) {
        const favorites = updated.filter(e => e.isFavorite);
        const nonFavorites = updated.filter(e => !e.isFavorite);
        return [...favorites, ...nonFavorites.slice(0, MAX_ENTRIES - favorites.length)];
      }
      return updated;
    });

    return id;
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, isFavorite: !entry.isFavorite }
          : entry
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const getEntry = useCallback((id: string): HistoryEntry | undefined => {
    return entries.find(entry => entry.id === id);
  }, [entries]);

  const clearAll = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    isLoaded,
    addEntry,
    toggleFavorite,
    deleteEntry,
    getEntry,
    clearAll,
  };
}
