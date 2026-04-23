# Community Board Application

日本語向けの掲示板アプリです。Figmaベースの UI を維持しつつ、ロリポップ MySQL + Prisma + NextAuth Credentials で動作します。

## 現在の実装

- メイン画面（投稿作成・一覧・ピン留め・返信）が API 経由で動作
- 投稿の `ownerId` に基づく編集/削除（クライアント表示 + サーバー検証）
- NextAuth.js `CredentialsProvider`（メールアドレス + パスワード）
- パスワードの bcrypt ハッシュ保存
- Prisma + MySQL（User / Post / Reply のリレーション）

## API ルート

- `GET /api/boards`: 投稿一覧を取得
- `POST /api/boards`: 新規投稿を作成（要ログイン）
- `PUT /api/boards/[id]`: 投稿を更新（投稿オーナーのみ）
- `DELETE /api/boards/[id]`: 投稿を削除（投稿オーナーのみ）
- `POST /api/boards/[id]/replies`: 返信を追加（要ログイン）

## 開発

```bash
cp .env.local.example .env.local
npm install
 npx prisma migrate dev --name init
npm run dev
```

http://localhost:3000 で確認できます。

## 環境変数

- 認証: `NEXTAUTH_*`
- DB: `MYSQL_*`, `DATABASE_URL`

`.env.local.example` を参照してください。
