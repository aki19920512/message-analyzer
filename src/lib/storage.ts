import type { Partner, LastScores } from '@/types/analysis';

const STORAGE_KEY = 'partnerProfiles';

// パートナー一覧を取得（破損時は空配列で初期化）
export function getPartners(): Partner[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('localStorage data is not an array, resetting...');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (e) {
    console.error('Failed to parse localStorage, resetting...', e);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

// パートナー一覧を保存
export function savePartners(partners: Partner[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// IDでパートナーを取得
export function getPartnerById(id: string): Partner | null {
  const partners = getPartners();
  return partners.find((p) => p.id === id) || null;
}

// 名前でパートナーを検索
export function getPartnerByName(name: string): Partner | null {
  const partners = getPartners();
  return partners.find((p) => p.partnerName === name) || null;
}

// 新規パートナーを追加
export function addPartner(partner: Omit<Partner, 'id' | 'updatedAt' | 'lastScores'>): Partner {
  const partners = getPartners();

  const newPartner: Partner = {
    ...partner,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    lastScores: null,
  };

  partners.push(newPartner);
  savePartners(partners);

  return newPartner;
}

// パートナーを更新
export function updatePartner(
  id: string,
  updates: Partial<Pick<Partner, 'partnerName' | 'profileText' | 'lastScores'>>
): Partner | null {
  const partners = getPartners();
  const index = partners.findIndex((p) => p.id === id);

  if (index === -1) return null;

  partners[index] = {
    ...partners[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  savePartners(partners);
  return partners[index];
}

// 解析後にスコアを更新
export function updatePartnerScores(id: string, scores: LastScores): Partner | null {
  return updatePartner(id, { lastScores: scores });
}

// パートナーを削除
export function deletePartner(id: string): boolean {
  const partners = getPartners();
  const filtered = partners.filter((p) => p.id !== id);

  if (filtered.length === partners.length) return false;

  savePartners(filtered);
  return true;
}

// 同名のパートナーが存在するか確認
export function hasPartnerWithName(name: string, excludeId?: string): boolean {
  const partners = getPartners();
  return partners.some((p) => p.partnerName === name && p.id !== excludeId);
}
