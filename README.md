# 교통사고 합의대행 전용 CRM 어드민 v2

교통사고 합의대행 업무만 남긴 경량형 Next.js/Supabase CRM입니다.

## 포함 기능

- Supabase Auth 로그인
- 이메일 또는 로그인ID 로그인
- 직원 계정 생성 시 자유로운 로그인ID/비밀번호 입력 후 내부 정규화
- 비밀번호 변경
- 대시보드
- 교통사고 DB관리
- 보험사 DB
- 제휴업체 DB
- 병원 DB
- 계약현황
- 정산관리
- 자료공유 게시판
- 각 DB 상세페이지 파일 업로드
- KST 기준 시간 표시
- 모든 삭제 soft delete

## 기술스택

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase PostgreSQL/Auth/Storage
- Vercel

## 설치

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 환경변수

`.env.local` 또는 Vercel Environment Variables에 아래 값을 넣습니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key
SUPABASE_SERVICE_ROLE_KEY=service_role_key
```

`NEXT_PUBLIC_SUPABASE_URL`은 dashboard 주소가 아니라 `.supabase.co` API URL이어야 합니다.

## Supabase DB 적용

새 프로젝트 기준:

```bash
npx supabase login
npx supabase link --project-ref 프로젝트REF
npx supabase db push
```

적용 migration:

```text
supabase/migrations/000001_init_traffic_admin.sql
```

## 최초 ADMIN 생성

Supabase Dashboard에서 Auth 유저를 먼저 만듭니다.

1. Authentication → Users → Add user
2. 이메일/비밀번호 입력
3. Auto Confirm User 체크
4. 생성된 User UID 복사
5. Table Editor → profiles → Insert row

예시:

```text
auth_user_id = Auth User UID
name = 관리자
email = admin@example.com
login_id = admin
auth_email = admin@example.com
role = ADMIN
is_active = true
```

이후 `/login`에서 이메일 또는 `admin` login_id로 로그인할 수 있습니다.

## Vercel 배포

1. GitHub에 push
2. Vercel에서 GitHub repo 연결
3. Environment Variables 3개 입력
4. Deploy

## 주의

- `.env.local`은 절대 GitHub에 올리지 마세요.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용입니다.
- 파일 업로드 bucket은 migration에서 `db-files`로 생성됩니다.
- Storage 정책은 운영 상황에 맞게 추가 보강할 수 있습니다.
