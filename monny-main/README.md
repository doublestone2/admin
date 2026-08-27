# Roguard Illegal Loan Landing (Next.js)

## 시작
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 배포
GitHub에 push 후 Vercel에서 import 하시면 됩니다.

## 환경변수
- NEXT_PUBLIC_POSTHOG_KEY
- NEXT_PUBLIC_POSTHOG_HOST
- NEXT_PUBLIC_KAKAO_LINK
- NEXT_PUBLIC_LAWFIRM_LINK
- NEXT_PUBLIC_NAVER_CAFE_LINK
- GOOGLE_CLIENT_EMAIL
- GOOGLE_PRIVATE_KEY
- GOOGLE_SHEETS_ID

## 구글시트 헤더 권장
접수일시 | 이름 | 연락처 | 피해유형 | 추심강도 | 대여원금(만원) | 상환총액(만원) | 증거보유 | 주변인피해 | 초과상환추정(만원) | 추천조치 | 긴급도 | 요약 | 유입경로 | privacyAgreed