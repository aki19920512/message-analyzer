'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = () => {
    if (!message.trim()) return;
    localStorage.setItem('okurun_draft', message);
    router.push('/submit?mode=analyze&from=lp');
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('okurun_screenshot_data', reader.result as string);
      localStorage.setItem('okurun_screenshot', file.name);
      router.push('/submit?mode=analyze&from=lp');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const charCount = message.length;
  const isReady = message.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col" style={{ fontFamily: 'var(--font-zen, sans-serif)', background: '#FFFBF7' }}>
      <Header />

      <main className="flex-1">

        {/* ── ヒーロー ── */}
        <section className="hero-gradient relative overflow-hidden">
          {/* 浮遊絵文字デコレーション */}
          <span className="animate-float pointer-events-none absolute left-[8%] top-[12%] text-3xl opacity-40 select-none">💬</span>
          <span className="animate-float-alt pointer-events-none absolute right-[10%] top-[18%] text-2xl opacity-30 select-none">✨</span>
          <span className="animate-float pointer-events-none absolute left-[15%] bottom-[20%] text-2xl opacity-25 select-none">💗</span>
          <span className="animate-float-alt pointer-events-none absolute right-[18%] bottom-[25%] text-xl opacity-20 select-none">🌸</span>

          <div className="relative mx-auto max-w-2xl px-4 py-14 sm:py-20 text-center">
            {/* バッジ */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4"
              style={{ background: 'rgba(244,114,182,0.15)', color: '#DB2777' }}>
              <span>✨</span> AI メッセージ添削
            </span>

            {/* キャッチコピー */}
            <h1 className="text-2xl sm:text-4xl font-bold leading-tight text-gray-900 mb-3" style={{ textWrap: 'balance' }}>
              送る前に、<br className="sm:hidden" /><span style={{ color: '#F472B6' }}>ちょっと待って</span>。<br />
              そのメッセージ、大丈夫？
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
              <span className="block">相手の性格、距離感、やり取りの流れ。</span>
              <span className="block">全部わかった上で「こう送ろう」を一緒に考える。</span>
              <span className="block">あなた専用の、お守り。</span>
            </p>

            {/* メイン入力エリア */}
            <div className="glass-card p-4 sm:p-6 text-left shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                送る予定のメッセージを貼り付け
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="例：ねえ、なんで返事くれないの？既読してるよね？"
                rows={4}
                className="w-full rounded-xl border p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: 'rgba(244,114,182,0.3)',
                  background: 'rgba(255,255,255,0.9)',
                  // @ts-expect-error - CSS custom property
                  '--tw-ring-color': '#F472B6',
                }}
              />
              <div className="flex items-center justify-between mt-3 gap-3">
                <span className="text-xs text-gray-400">{charCount} 文字</span>
                <button
                  onClick={handleAnalyze}
                  disabled={!isReady}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: isReady
                      ? 'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)'
                      : '#d1d5db',
                  }}
                >
                  <span className="material-symbols-outlined filled" style={{ fontSize: 18 }}>
                    auto_awesome
                  </span>
                  チェックする
                </button>
              </div>
            </div>

            {/* OCR ドロップゾーン */}
            <div
              className={`dropzone-border mt-4 p-5 text-center cursor-pointer transition-all ${isDragging ? 'opacity-80 scale-[0.98]' : ''}`}
              style={{ background: isDragging ? 'rgba(244,114,182,0.08)' : 'rgba(255,255,255,0.5)' }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="text-2xl mb-1">📷</div>
              <p className="text-sm font-medium" style={{ color: '#F472B6' }}>
                スクショをドロップ or タップして選択
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                コピーできないアプリの画面もOK（OCR対応）
              </p>
            </div>
          </div>
        </section>

        {/* ── 共感セクション ── */}
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F472B6' }}>
              こんな経験ありませんか？
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
              送った後に後悔したことがある人へ
            </h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {[
                { emoji: '😰', text: '既読スルーされてから「あの文、重かったかな…」と反省した' },
                { emoji: '😤', text: '怒りまかせに送ったら関係が気まずくなった' },
                { emoji: '🙈', text: '一生懸命書いたのに「長すぎ」と思われていそうで怖い' },
                { emoji: '🎯', text: '「この人にはどう言えば？」——同じ内容でも、相手によって伝え方は変わる。でもその"正解"は誰にも聞けない。' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-5 text-left" style={{ background: '#FFF1F5' }}>
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-base text-gray-600">
              オクルンは「送る前」に使うAIアドバイザー。<br />
              <span className="font-semibold" style={{ color: '#DB2777' }}>後悔する前に、チェックしよう。</span>
            </p>
          </div>
        </section>

        {/* ── 機能紹介 ── */}
        <section className="py-12 sm:py-16" style={{ background: '#FFFBF7' }}>
          <div className="mx-auto max-w-3xl px-4">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F472B6' }}>
                Features
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                オクルンでできること
              </h2>
            </div>
            {/* ★ 機能0: あなたの相手を、覚える（差別化カード） */}
            <div className="mb-6 rounded-3xl p-6 sm:p-8 shadow-sm" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)' }}>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                {/* 左: テキスト */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-3"
                    style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', color: '#92400E' }}>
                    ★ いちばんの特長
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">あなたの相手を、覚える</h3>
                  <p className="text-sm font-medium mb-3" style={{ color: '#DB2777' }}>関係性を理解した、あなただけのアドバイス</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    <span className="block">相手の性格、ふたりの距離感、やり取りの傾向をオクルンが記憶。</span>
                    <span className="block">&ldquo;この相手にはストレートに伝えたほうがいい&rdquo;</span>
                    <span className="block">&ldquo;この人には少しクッションを入れて&rdquo;</span>
                    <span className="block">——相手ごとに最適なアドバイスを届けます。</span>
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li className="flex items-center gap-2"><span style={{ color: '#F472B6' }}>✓</span> 相手の性格や好みを登録できる</li>
                    <li className="flex items-center gap-2"><span style={{ color: '#F472B6' }}>✓</span> やり取りの傾向を自動で学習</li>
                    <li className="flex items-center gap-2"><span style={{ color: '#F472B6' }}>✓</span> 相手ごとに最適なトーンを提案</li>
                  </ul>
                </div>
                {/* 右: デモUI */}
                <div className="w-full sm:w-72 shrink-0 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <p className="text-xs font-bold text-gray-500 mb-3">相手を選択</p>
                  <div className="flex gap-2 mb-3">
                    {[
                      { icon: '🧑‍💼', name: 'たくや', active: true },
                      { icon: '👩', name: 'みさき', active: false },
                      { icon: '🤵', name: '上司', active: false },
                    ].map((p, i) => (
                      <div key={i} className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${p.active ? 'shadow-sm ring-2 ring-pink-400' : 'opacity-60'}`}
                        style={p.active ? { background: '#FFF1F5' } : {}}>
                        <span className="text-xl">{p.icon}</span>
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg px-3 py-1.5 font-medium" style={{ background: '#FFF1F5', color: '#DB2777' }}>
                      💕 関係性: 付き合って3ヶ月
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="rounded-full px-2 py-0.5" style={{ background: '#F0FDF4', color: '#166534' }}>返信早め</span>
                      <span className="rounded-full px-2 py-0.5" style={{ background: '#FEF3C7', color: '#92400E' }}>絵文字多め</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 機能 1-3 */}
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: 'thermostat',
                  title: '温度感チェック',
                  desc: 'メッセージの温度を数値化。「重すぎ」を送る前にキャッチ。',
                },
                {
                  icon: 'speed',
                  title: '圧力リスク判定',
                  desc: '追いLINE・長文・詰問を自動で検出。送る前に気づける。',
                },
                {
                  icon: 'auto_awesome',
                  title: '3パターン提案',
                  desc: '丁寧・カジュアル・ユーモアの3案を提示。好きなトーンを選ぶだけ。',
                },
              ].map((f, i) => (
                <div key={i} className="glass-card p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(244,114,182,0.12)', color: '#F472B6' }}>
                    <span className="material-symbols-outlined filled" style={{ fontSize: 28 }}>{f.icon}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 使い方3ステップ ── */}
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F472B6' }}>
                How to use
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                4ステップで完了
              </h2>
            </div>
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-4">
              {[
                { step: '01', icon: '👤', title: '相手を選ぶ', desc: '誰に送るメッセージ？相手を選ぶだけで、関係性に合わせた分析に。初めてなら30秒で登録できるよ。' },
                { step: '02', icon: '✏️', title: 'メッセージを入力', desc: '下書きを入力、またはLINEのスクショをアップ。' },
                { step: '03', icon: '🤖', title: 'AIが相手に合わせて分析', desc: '相手の性格や過去のやり取りを踏まえて、温度チェック＆言いかえ提案。' },
                { step: '04', icon: '💌', title: '自信を持って送信', desc: '納得できたら、ワンタップでコピーして送信。' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full text-2xl"
                    style={{ background: 'linear-gradient(135deg, #FFF1F5, #FCE7F3)' }}>
                    {s.icon}
                  </div>
                  <div className="text-xs font-bold mb-1" style={{ color: '#F472B6' }}>STEP {s.step}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 利用シーン ── */}
        <section className="py-12 sm:py-16" style={{ background: '#FFF1F5' }}>
          <div className="mx-auto max-w-3xl px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                こんな場面で使えます
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { emoji: '💕', scene: '好きな人へのLINE', desc: '気持ちは伝えたい。でも重くなりたくない。' },
                { emoji: '😔', scene: '喧嘩後の仲直りメッセージ', desc: '感情的になりすぎず、でも誠実に。' },
                { emoji: '📱', scene: '既読スルーへの返信催促', desc: '催促したいけど、また無視されたくない…' },
                { emoji: '👥', scene: '友人・同僚へのお断り', desc: 'ちゃんと断りたいけど傷つけたくない。' },
                { emoji: '💼', scene: '職場の上司・先輩へ', desc: '丁寧すぎず、フランクすぎず。絶妙なトーンに。' },
                { emoji: '🌙', scene: '夜中に送りそうな衝動的な文', desc: '送る前に一呼吸。後悔しないために。' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl p-4 bg-white shadow-sm">
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{item.scene}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 安心ポイント ── */}
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F472B6' }}>
                Privacy & Safety
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                プライバシーへの配慮
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: '🔒', title: '入力内容は保存しない', desc: '分析後すぐに破棄。サーバーに履歴は残りません。' },
                { icon: '🚫', title: '個人情報を学習しない', desc: 'あなたのメッセージをAIの学習に使用しません。' },
                { icon: '📴', title: 'アカウント不要', desc: '登録不要・ログイン不要で今すぐ使えます。' },
              ].map((p, i) => (
                <div key={i} className="text-center rounded-2xl p-5" style={{ background: '#FFFBF7' }}>
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{p.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 sm:py-16" style={{ background: '#FFFBF7' }}>
          <div className="mx-auto max-w-2xl px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">よくある質問</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  q: '無料で使えますか？',
                  a: 'はい、現在は無料でご利用いただけます。',
                },
                {
                  q: 'スマートフォンでも使えますか？',
                  a: 'もちろんです。スマートフォン・タブレット・PCすべてに対応しています。',
                },
                {
                  q: 'メッセージの内容が外部に漏れることはありますか？',
                  a: '入力されたメッセージはAI分析にのみ使用し、分析後は即座に破棄されます。第三者への提供や学習への使用は一切行いません。',
                },
                {
                  q: 'LINEやInstagramのスクショを読み取れますか？',
                  a: 'はい、スクリーンショットをドロップまたはタップして選択することでOCR（画像文字認識）により読み取れます。',
                },
                {
                  q: 'AIの提案は必ず使わないといけませんか？',
                  a: 'いいえ、提案はあくまで参考です。気に入ったものをそのままコピーしてもよいですし、参考にしながら自分の言葉でアレンジしていただいて構いません。',
                },
              ].map((faq, i) => (
                <details key={i} className="faq-item rounded-2xl bg-white shadow-sm overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 hover:bg-pink-50 transition-colors">
                    <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                    <span className="faq-arrow shrink-0 transition-transform duration-200 text-gray-400">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>expand_more</span>
                    </span>
                  </summary>
                  <div className="px-5 pb-4 pt-0 text-sm text-gray-600 leading-relaxed border-t" style={{ borderColor: 'rgba(244,114,182,0.1)' }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 最終CTA ── */}
        <section className="hero-gradient py-14 sm:py-20 text-center">
          <div className="mx-auto max-w-lg px-4">
            <div className="text-4xl mb-4">💌</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              さあ、送る前にチェックしよう
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              登録不要・無料・30秒で完了。<br />
              後悔しないメッセージを、一緒に作りましょう。
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => document.querySelector('textarea')?.focus(), 600);
              }}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)' }}
            >
              <span className="material-symbols-outlined filled" style={{ fontSize: 20 }}>favorite</span>
              今すぐ使ってみる（無料）
            </button>
          </div>
        </section>

        {/* ── フッターリンク ── */}
        <section className="bg-white border-t py-10" style={{ borderColor: 'rgba(244,114,182,0.15)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid grid-cols-3 gap-8 text-sm">
              {/* 1列目: オクルンについて */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">オクルンについて</h3>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="/guide#features" className="hover:text-pink-500 transition-colors">特徴</a></li>
                  <li><a href="/guide" className="hover:text-pink-500 transition-colors">使い方</a></li>
                  <li><a href="/pricing" className="hover:text-pink-500 transition-colors">料金</a></li>
                </ul>
              </div>
              {/* 2列目: サポート */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">サポート</h3>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="/guide#faq" className="hover:text-pink-500 transition-colors">よくある質問</a></li>
                  <li><a href="/contact" className="hover:text-pink-500 transition-colors">お問い合わせ</a></li>
                  <li><a href="/legal" className="hover:text-pink-500 transition-colors">特商法</a></li>
                </ul>
              </div>
              {/* 3列目: リーガル */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">リーガル</h3>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="/terms" className="hover:text-pink-500 transition-colors">利用規約</a></li>
                  <li><a href="/privacy" className="hover:text-pink-500 transition-colors">プライバシー</a></li>
                  <li><a href="/refund" className="hover:text-pink-500 transition-colors">返金ポリシー</a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* ── スマホ固定CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden"
        style={{ background: 'rgba(255,241,245,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(244,114,182,0.2)' }}>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => document.querySelector('textarea')?.focus(), 600);
          }}
          className="w-full rounded-full py-3 text-sm font-bold text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)' }}
        >
          ✨ メッセージをチェックする（無料）
        </button>
      </div>
    </div>
  );
}
