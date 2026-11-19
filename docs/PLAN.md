# 할일 + 계획 관리 앱 구현 계획

**상태:** 구현 완료 (Vercel 배포됨)
**작성:** 2026-11-18
**최종 수정:** 2026-11-19
**PRD:** docs/PRD.md
**배포 URL:** https://todo-plan-app-sangbum-kims-projects.vercel.app

---

## 요약

Next.js 14 (App Router) + TypeScript + MongoDB(Mongoose) 기반의 할일·주간계획·1년목표 연결 관리 앱.
GitHub OAuth 로그인으로 사용자별 데이터를 분리하며, dnd-kit 칸반 보드로 할일 상태를 관리한다.

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 14 App Router | SSR + API Routes 통합 |
| 언어 | TypeScript | 타입 안전성 |
| DB | MongoDB + Mongoose | 유연한 스키마, 빠른 개발 |
| 스타일 | Tailwind CSS | 빠른 UI 구성 |
| 인증 | NextAuth.js + GitHub OAuth | 소셜 로그인, 세션 관리 |
| 상태 관리 | React Hooks (useState/useEffect) | 경량, 별도 라이브러리 불필요 |
| 드래그앤드랍 | @dnd-kit/core + @dnd-kit/sortable | React 18 호환, 접근성 지원 |
| 날짜 처리 | date-fns | ISO week 기준 처리 |

---

## 데이터 모델

### User (사용자)
```ts
{
  _id: ObjectId
  githubId: string        // unique, GitHub OAuth ID
  username: string
  email: string
  avatarUrl: string
  createdAt: Date
  updatedAt: Date
}
```

### YearlyGoal (1년 목표)
```ts
{
  _id: ObjectId
  title: string
  description: string
  year: number
  order: number
  userId: ObjectId        // -> User
  createdAt: Date
  updatedAt: Date
}
```

### WeeklyPlan (주간 계획)
```ts
{
  _id: ObjectId
  yearlyGoalId?: ObjectId  // -> YearlyGoal (선택)
  weekStart: Date
  goals: [{               // 주간 목표 서브도큐먼트 (최대 5개)
    _id: ObjectId
    title: string
    completed: boolean
  }]
  memo: string
  retrospective: string    // P1
  order: number
  userId: ObjectId         // -> User
  createdAt: Date
  updatedAt: Date
}
```

### Todo (할일)
```ts
{
  _id: ObjectId
  title: string
  description?: string
  status: 'todo' | 'doing' | 'done'
  priority: 'high' | 'medium' | 'low'  // P1, default 'medium'
  dueDate?: Date                         // P1
  weeklyPlanId?: ObjectId   // -> WeeklyPlan (선택)
  weeklyGoalId?: ObjectId   // 주간 목표 서브도큐먼트 ID (선택)
  dayOfWeek?: number        // 0=월 ~ 6=일 (선택)
  order: number
  userId: ObjectId          // -> User
  createdAt: Date
  updatedAt: Date
}
```

> `dayOfWeek` 기준: 0=월요일 ~ 6=일요일. JS `Date.getDay()`(0=일요일)와 다름에 유의.

---

## 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (AuthProvider 포함)
│   ├── page.tsx                      # 랜딩 (대시보드 리다이렉트)
│   ├── login/page.tsx                # 로그인 페이지
│   ├── dashboard/page.tsx            # 대시보드 (이번 주 현황)
│   ├── todos/page.tsx                # 칸반 보드
│   ├── weekly/page.tsx               # 주간 계획
│   ├── goals/page.tsx                # 1년 목표
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth GitHub OAuth
│       ├── todos/
│       │   ├── route.ts              # GET (필터: status, weeklyPlanId), POST
│       │   └── [id]/route.ts         # GET, PUT, DELETE
│       ├── weekly-plans/
│       │   ├── route.ts              # GET (필터: yearlyGoalId, weekStart), POST
│       │   └── [id]/route.ts         # GET, PUT, DELETE
│       └── goals/
│           ├── route.ts              # GET, POST
│           └── [id]/route.ts         # GET, PUT, DELETE
├── components/
│   ├── layout/
│   │   ├── AuthProvider.tsx          # NextAuth SessionProvider 래퍼
│   │   ├── AuthGuard.tsx             # 미인증 사용자 리다이렉트
│   │   └── Sidebar.tsx               # 네비게이션 사이드바
│   ├── todos/
│   │   ├── TodoBoard.tsx             # 칸반 보드 (DndContext 컨테이너)
│   │   ├── TodoColumn.tsx            # 상태별 컬럼 (todo/doing/done)
│   │   ├── TodoCard.tsx              # 개별 할일 카드
│   │   └── TodoForm.tsx              # 할일 생성/수정 폼
│   ├── weekly/
│   │   ├── WeeklyPlanCard.tsx        # 주간 계획 카드
│   │   ├── WeeklyCalendar.tsx        # 요일별 할일 배치 뷰 (DnD)
│   │   ├── WeeklyMemo.tsx            # 주간 메모
│   │   ├── WeeklyProgress.tsx        # 주간 진행률 (P1)
│   │   └── WeeklyRetrospective.tsx   # 주간 회고 (P1)
│   └── goals/
│       ├── GoalCard.tsx              # 목표 카드
│       ├── GoalForm.tsx              # 목표 생성/수정 폼
│       └── GoalProgress.tsx          # 목표별 진행률 (P1)
├── hooks/
│   ├── useTodos.ts                   # Todo CRUD + 상태 관리
│   ├── useWeeklyPlans.ts             # WeeklyPlan CRUD + 상태 관리
│   └── useGoals.ts                   # YearlyGoal CRUD + 상태 관리
├── lib/
│   ├── mongodb.ts                    # MongoDB 연결 싱글톤 (global 캐싱)
│   ├── auth.ts                       # NextAuth 옵션 (GitHub Provider)
│   ├── getSessionUser.ts             # API 인증 헬퍼
│   └── utils.ts                      # 날짜/주차 유틸리티
├── models/
│   ├── User.ts                       # Mongoose User 모델
│   ├── Todo.ts                       # Mongoose Todo 모델
│   ├── WeeklyPlan.ts                 # Mongoose WeeklyPlan 모델
│   └── YearlyGoal.ts                 # Mongoose YearlyGoal 모델
└── types/
    ├── index.ts                      # 공통 TypeScript 타입
    └── next-auth.d.ts                # NextAuth 세션 타입 확장
```

---

## 구현 완료 내역

### Phase 1 — 프로젝트 셋업
- [x] Next.js 14 + TypeScript + Tailwind CSS + ESLint 초기화
- [x] 패키지 설치: mongoose, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, date-fns, next-auth
- [x] `lib/mongodb.ts` — Mongoose 연결 캐싱 (global 객체, 함수 내부 환경변수 검사)
- [x] 루트 레이아웃 + Sidebar 컴포넌트

### Phase 2 — 인증
- [x] NextAuth.js + GitHub OAuth 설정
- [x] User 모델 (githubId, username, email, avatarUrl)
- [x] AuthProvider (SessionProvider 래퍼)
- [x] AuthGuard (미인증 리다이렉트)
- [x] 로그인 페이지 (`/login`)
- [x] API 인증 헬퍼 (`getSessionUser`)
- [x] 모든 API Route에 userId 기반 데이터 격리 적용

### Phase 3 — 데이터 레이어
- [x] Mongoose 모델 4개 (User, YearlyGoal, WeeklyPlan, Todo)
- [x] TypeScript 타입 정의 (`types/index.ts`, `next-auth.d.ts`)
- [x] Goals API — GET, POST, PUT, DELETE
- [x] Weekly Plans API — GET(필터), POST, PUT, DELETE
- [x] Todos API — GET(필터), POST, PUT, DELETE
- [x] Custom hooks 3개 (useTodos, useWeeklyPlans, useGoals)

### Phase 4 — 핵심 UI (P0)
- [x] 1년 목표 페이지 — CRUD UI (GoalCard, GoalForm)
- [x] 주간 계획 페이지 — 계획 생성, 목표 연결, 주간 메모
- [x] 칸반 보드 — 3개 컬럼 (todo/doing/done) + dnd-kit 드래그앤드랍
- [x] 요일별 할일 배치 (WeeklyCalendar)
- [x] 대시보드 — 이번 주 현황 요약

### Phase 5 — 추가 기능 (P1)
- [x] 우선순위 (High/Medium/Low) 설정 + 표시
- [x] 마감일 설정 + 표시
- [x] 주간 진행률 (WeeklyProgress)
- [x] 목표별 진행률 (GoalProgress)
- [x] 주간 회고 (WeeklyRetrospective)

### Phase 6 — 배포
- [x] Vercel 배포 설정
- [x] 환경변수 등록 (MONGODB_URI, NEXTAUTH_SECRET, GITHUB_ID, GITHUB_SECRET, NEXTAUTH_URL)
- [x] MongoDB 연결 검사 빌드 호환성 수정 (모듈 레벨 → 함수 내부)
- [x] GitHub OAuth Callback URL 배포 도메인으로 설정

---

## 환경변수

| 변수 | 용도 | 환경 |
|------|------|------|
| `MONGODB_URI` | MongoDB Atlas 연결 문자열 | 로컬 + Vercel |
| `NEXTAUTH_SECRET` | NextAuth 세션 암호화 키 | 로컬 + Vercel |
| `NEXTAUTH_URL` | 로컬: `http://localhost:3000` / Vercel: 배포 URL | 환경별 분리 |
| `GITHUB_ID` | GitHub OAuth App Client ID | 로컬 + Vercel |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret | 로컬 + Vercel |

---

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| Mongoose 연결 누수 | `lib/mongodb.ts`에서 `global` 객체로 연결 캐싱 |
| dnd-kit SSR 문제 | `'use client'` 지시어 적용 |
| MongoDB 환경변수 빌드 타임 에러 | 환경변수 검사를 `dbConnect()` 함수 내부에서 수행 |
| GitHub OAuth Callback URL 불일치 | 로컬용/배포용 URL을 GitHub OAuth App에 등록 |

---

## 검증 완료 항목

1. [x] `npm run build` — 빌드 에러 없이 완료
2. [x] GitHub OAuth 로그인 → 사용자 정보 DB 저장
3. [x] 미인증 사용자 → `/login` 리다이렉트
4. [x] 할일 CRUD (생성/조회/수정/삭제)
5. [x] 드래그앤드랍 상태 변경 (todo → doing → done)
6. [x] 주간 계획 생성 → 1년 목표 연결
7. [x] 요일별 할일 배치
8. [x] 주간 메모 작성/저장
9. [x] Vercel 배포 정상 작동

---

## npm 의존성

**Production:**
```
next@14.2.35
react@^18 / react-dom@^18
mongoose@^9.12.2
next-auth@^4.24.15
@dnd-kit/core@^6.3.1
@dnd-kit/sortable@^10.0.0
@dnd-kit/utilities@^3.2.2
date-fns@^4.4.0
```

**Dev:**
```
typescript@^5
@types/node@^20
@types/react@^18
@types/react-dom@^18
eslint@^8
eslint-config-next@14.2.35
postcss@^8
tailwindcss@^3.4.1
```
