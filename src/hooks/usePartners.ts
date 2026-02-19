'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Partner, LastScores } from '@/types/analysis';
import {
  getPartners,
  addPartner as addPartnerToStorage,
  updatePartner as updatePartnerInStorage,
  deletePartner as deletePartnerFromStorage,
  updatePartnerScores as updateScoresInStorage,
  hasPartnerWithName,
  getPartnerById,
} from '@/lib/storage';

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期読み込み
  useEffect(() => {
    setPartners(getPartners());
    setIsLoading(false);
  }, []);

  // パートナー一覧を再読み込み
  const refresh = useCallback(() => {
    setPartners(getPartners());
  }, []);

  // パートナーを追加
  const addPartner = useCallback(
    (partnerName: string, profileText: string): Partner | { error: string } => {
      // 同名チェック
      if (hasPartnerWithName(partnerName)) {
        return { error: `「${partnerName}」は既に登録されています` };
      }

      const newPartner = addPartnerToStorage({ partnerName, profileText });
      setPartners(getPartners());
      return newPartner;
    },
    []
  );

  // パートナーを更新
  const updatePartner = useCallback(
    (
      id: string,
      updates: Partial<Pick<Partner, 'partnerName' | 'profileText'>>
    ): Partner | { error: string } => {
      // 同名チェック（自分以外）
      if (updates.partnerName && hasPartnerWithName(updates.partnerName, id)) {
        return { error: `「${updates.partnerName}」は既に登録されています` };
      }

      const updated = updatePartnerInStorage(id, updates);
      if (!updated) {
        return { error: 'パートナーが見つかりません' };
      }

      setPartners(getPartners());
      return updated;
    },
    []
  );

  // スコアを更新
  const updateScores = useCallback((id: string, scores: LastScores): boolean => {
    const updated = updateScoresInStorage(id, scores);
    if (updated) {
      setPartners(getPartners());
      return true;
    }
    return false;
  }, []);

  // パートナーを削除
  const deletePartner = useCallback((id: string): boolean => {
    const success = deletePartnerFromStorage(id);
    if (success) {
      setPartners(getPartners());
    }
    return success;
  }, []);

  // IDでパートナーを取得
  const getPartner = useCallback((id: string): Partner | null => {
    return getPartnerById(id);
  }, []);

  return {
    partners,
    isLoading,
    refresh,
    addPartner,
    updatePartner,
    updateScores,
    deletePartner,
    getPartner,
  };
}
