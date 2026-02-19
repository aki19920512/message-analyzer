'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProfileAnalysis } from '@/types/analysis';

interface ProfileCardProps {
  profile: ProfileAnalysis;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">相手のプロフィール分析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              返信ペース
            </dt>
            <dd className="mt-1">{profile.pace}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              コミュニケーションスタイル
            </dt>
            <dd className="mt-1">{profile.style}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              境界線の傾向
            </dt>
            <dd className="mt-1">{profile.boundaries}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              関係性の進展度
            </dt>
            <dd className="mt-1">{profile.progress}</dd>
          </div>
        </div>

        {profile.notes && profile.notes.length > 0 && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-2">
              その他の気づき
            </dt>
            <dd>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {profile.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
