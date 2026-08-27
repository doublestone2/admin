"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";

const DEFAULT_KAKAO_LINK = "http://pf.kakao.com/_CUPCX/chat";
const DEFAULT_LAWFIRM_SITE_LINK = "https://xn--9z2b2xi4aba940lua.com/";
const DEFAULT_NAVER_CAFE_LINK = "https://cafe.naver.com/coincheating";

function buildLandingHtml({ kakaoLink, lawfirmLink, cafeLink }) {
  return LANDING_HTML
    .replaceAll("__KAKAO_LINK__", kakaoLink)
    .replaceAll("__LAW_FIRM_LINK__", lawfirmLink)
    .replaceAll("__NAVER_CAFE_LINK__", cafeLink);
}

function ProgressRing({ progress }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * progress) / 100;

  return (
    <div className="lg-progress-ring">
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(245,241,232,0.12)" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#C9A961"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="lg-progress-ring__center">
        <strong>{progress}%</strong>
        <span>분석중</span>
      </div>
    </div>
  );
}

function StepChoice({ selected, onClick, children, multiple = false }) {
  return (
    <button
      type="button"
      className={`lg-step-choice${selected ? " is-selected" : ""}${multiple ? " is-multiple" : ""}`}
      onClick={onClick}
    >
      {multiple && <span className="lg-step-choice__marker" aria-hidden="true">{selected ? "✓" : "+"}</span>}
      <span>{children}</span>
    </button>
  );
}

function toggleSelection(list = [], value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

const LANDING_HTML = `<header>
  <div class="container header-inner">
    <div class="logo-group">
      <div class="logo-text">
        <div class="brand">LawGuard</div>
        <div class="tagline">매일법률사무소 · 불법사채 대응</div>
      </div>
    </div>
    <nav class="header-nav">
      <a href="__LAW_FIRM_LINK__" target="_blank" rel="noreferrer">매일법률사무소</a>
      <a href="__LAW_FIRM_LINK__" target="_blank" rel="noreferrer">개인회생</a>
      <a href="__NAVER_CAFE_LINK__" target="_blank" rel="noreferrer">카페</a>
    </nav>
  </div>
</header>

<!-- ================= HERO ================= -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="eyebrow animate">
          <svg viewBox="0 0 24 24"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"/></svg>
          LawGuard × 매일법률사무소 · 불법사채 전담
        </div>
        <h1 class="hero-title animate">
          멈춰야 할 건<br>
          당신의 일상이 아니라<br>
          <span class="accent">그들의 불법 추심</span>입니다.
        </h1>
        <p class="hero-sub animate">
          연 20%를 넘는 이자, 가족·직장으로의 연락, 밤낮없는 협박.<br>
          당신이 잘못한 게 아니라, <strong style="color: var(--ivory);">그들이 저지른 범죄</strong>입니다.
        </p>
        <div class="hero-trust animate">
          <strong>변호사법상 비밀유지 의무</strong>로 보호됩니다.<br>
          상담 내역은 채권자에게 절대 통보되지 않습니다.
        </div>
        <div class="hero-cta-group animate">
          <button type="button" class="btn-primary js-open-diagnosis" data-source="hero">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
            1분 무료 진단
          </button>
          <a href="__KAKAO_LINK__" target="_blank" rel="noreferrer" class="btn-secondary js-kakao-cta" data-source="hero">카카오톡 익명 상담</a>
        </div>
        <div class="tag-row animate">
          <span class="tag">추심 중단</span>
          <span class="tag">환수 검토</span>
          <span class="tag">형사 대응</span>
          <span class="tag">가족 연락 차단</span>
        </div>
      </div>

      <div class="check-card animate">
        <div class="check-label">EMERGENCY CHECK</div>
        <h3 class="check-title">현재 이런 상태라면,<br>LAWGUARD가 지켜드리겠습니다</h3>
        <ul class="check-list">
          <li class="check-item">
            <span class="check-mark"><svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
            연 20% 넘는 이자를 요구받았다
          </li>
          <li class="check-item">
            <span class="check-mark"><svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
            욕설·협박 문자나 통화가 왔다
          </li>
          <li class="check-item">
            <span class="check-mark"><svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
            가족·지인·직장으로 연락이 갔다
          </li>
          <li class="check-item">
            <span class="check-mark"><svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
            원금보다 더 많이 갚은 것 같다
          </li>
          <li class="check-item">
            <span class="check-mark"><svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
            입금내역·대화내역이 남아 있다
          </li>
        </ul>
        <div class="check-footer">
          지금은 혼자 버티는 것보다 <strong>기록을 남기고 빠르게 정리하는 편</strong>이
          법적으로 유리합니다. 불법 추심은 <strong>형사 처벌 대상</strong>이며,
          초과 상환분은 <strong>환수 가능</strong>한 경우가 많습니다.
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= STATS ================= -->
<section class="stats">
  <div class="container">
    <div class="section-label">STATISTICS · 혼자만의 문제가 아닙니다</div>
    <h2 class="section-title">
      지금, 당신과 같은 상황으로<br>
      신고된 건만 연 <span style="color: var(--gold);">16,988건</span>
    </h2>
    <p class="section-sub">— 집계된 숫자보다 현실에서는 더 규모가 클 것입니다 —</p>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">16,988</div>
        <div class="stat-unit">건</div>
        <div class="stat-label">2025년 금감원<br>불법사금융 피해신고</div>
        <div class="stat-delta">2022년 대비 64%</div>
        <div class="stat-source">SOURCE · 금융감독원</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">309<span style="font-size: 36px;">억</span></div>
        <div class="stat-unit">범죄수익 환수액</div>
        <div class="stat-label">2025년 피해자에게<br>실제 돌려준 금액</div>
        <div class="stat-delta">전년 대비 65%</div>
        <div class="stat-source">SOURCE · 경찰청·금감원</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">3,365</div>
        <div class="stat-unit">건</div>
        <div class="stat-label">2025년 불법사금융<br>사범 검거·수사</div>
        <div class="stat-delta">전년 대비 70%</div>
        <div class="stat-source">SOURCE · 경찰청</div>
      </div>
    </div>

    <div class="stats-conclusion">
      <p>
        이 숫자가 말하는 건 단 하나 —<br>
        <span class="hl">불법사채로 많은 사람들이 피해를 보고 있다는 사실</span>,<br>
        <span class="hl">전문 로펌의 도움을 받아 전략적으로 대응해야 한다는 것</span>입니다.
      </p>
    </div>

    <div class="stats-footnote">
      <span class="law-badge">이자제한법</span>
      <span class="law-badge">대부업법 (2025.7.22 개정)</span>
      <span class="law-badge">채권추심법</span>
    </div>
  </div>
</section>

<!-- ================= WEAPONS ================= -->
<section class="weapons">
  <div class="container">
    <div class="weapons-header">
      <div class="section-label">YOUR LEGAL WEAPONS</div>
      <h2 class="section-title">
        그들이 저지른 짓을<br>
        <span style="color: var(--gold);">법으로 그대로</span> 돌려받게 합니다.
      </h2>
      <p class="section-sub">— 법률 전문가가 전략적으로 대응해야 합니다 —</p>
      <p class="extra">
       LawGuard 는 <strong>변호사가 직접 설계한 3가지 법적 무기</strong>를<br>
        피해자 상황에 맞춰 동시에 발동시킵니다.
      </p>
    </div>

    <div class="weapons-grid">

      <!-- WEAPON 01 -->
      <div class="weapon-card">
        <div class="weapon-header">
          <div class="weapon-badge">
            <span class="num">01</span>&nbsp;WEAPON
          </div>
          <div class="weapon-title-group">
            <div class="weapon-name">즉시 연락 차단</div>
            <div class="weapon-promise">"서면 통지 1장으로, 다음 날부터 추심이 멎습니다"</div>
          </div>
        </div>
        <div class="weapon-body">
          <div class="weapon-box">
            <div class="weapon-box-label">법적 근거</div>
            <div class="weapon-box-title">채권추심법 제8조의2<br>— 대리인 선임 시 연락 금지</div>
            <div class="weapon-box-content">
              변호사를 대리인으로 선임하고 <strong>서면 통지</strong>한 경우, 채권추심자는 채무자에게 방문·전화·문자를 할 수 없습니다.<br><br>
              위반 시 <strong>2천만 원 이하 과태료</strong>
            </div>
          </div>
          <div class="weapon-box">
            <div class="weapon-box-label">실제 효과</div>
            <div class="weapon-box-title">수임 → 서면 통지 → 추심 중단</div>
            <div class="weapon-box-content">
              <ul>
                <li>LawGuard 수임 → <strong>서면 통지 발송</strong></li>
                <li>통지 다음 날부터 추심 중단</li>
                <li>위반 시 과태료·형사 고소 병행</li>
                <li>채권자와 직접 연락할 일 없음</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="weapon-footer">발동까지 걸리는 시간 · <strong>최대 3일</strong></div>
      </div>

      <!-- WEAPON 02 -->
      <div class="weapon-card">
        <div class="weapon-header">
          <div class="weapon-badge">
            <span class="num">02</span>&nbsp;WEAPON
          </div>
          <div class="weapon-title-group">
            <div class="weapon-name">대부계약 무효 · 환수</div>
            <div class="weapon-promise">"연 60% 초과 계약은 법적으로 0원. 이미 낸 돈도 돌려받습니다"</div>
          </div>
        </div>
        <div class="weapon-body">
          <div class="weapon-box">
            <div class="weapon-box-label">법적 근거</div>
            <div class="weapon-box-title">이자제한법 제2조 · 대부업법 제8조의2</div>
            <div class="weapon-box-content">
              연 20% 초과분은 <strong>원칙적 무효</strong>. 2025년 7월 개정 대부업법에 따라 <strong>연 60% 초과 계약은 계약 자체가 무효</strong>.<br><br>
              대부제공자는 원금·이자를 청구할 수 없고, <strong>받은 돈은 반환해야 합니다.</strong>
            </div>
          </div>
          <div class="weapon-box">
            <div class="weapon-box-label">실제 효과</div>
            <div class="weapon-box-title">초과 상환분 반환 · 잔여 채무 소멸</div>
            <div class="weapon-box-content">
              <ul>
                <li>연 20% 초과분 → <strong>남은 채무 공제·반환</strong></li>
                <li>연 60% 초과 → 앞으로 갚을 의무 0원</li>
                <li>기존 상환액 전액 반환 대상</li>
                <li>금감원 무효확인서로 추심 근거 제거</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="weapon-footer">환수 가능액 · <strong>1분 무료 진단에서 바로 계산</strong></div>
      </div>

      <!-- WEAPON 03 -->
      <div class="weapon-card">
        <div class="weapon-header">
          <div class="weapon-badge">
            <span class="num">03</span>&nbsp;WEAPON
          </div>
          <div class="weapon-title-group">
            <div class="weapon-name">불법 추심 형사고소</div>
            <div class="weapon-promise">"당신이 겪은 괴롭힘은 이미 명문화된 형사 범죄입니다"</div>
          </div>
        </div>
        <div class="weapon-body">
          <div class="weapon-box">
            <div class="weapon-box-label">법적 근거</div>
            <div class="weapon-box-title">채권추심법 제9조 — 폭행·협박 등의 금지</div>
            <div class="weapon-box-content">
              다음은 모두 <strong>형사 처벌 대상</strong>:
              <ul>
                <li>폭행·협박·위계·위력 사용</li>
                <li><strong>야간(21시~익일 8시) 반복 연락</strong></li>
                <li>가족·직장 등 제3자에 알림</li>
                <li>대신 갚으라는 요구</li>
              </ul>
              사진 협박 → 성폭력처벌법 병합 적용
            </div>
          </div>
          <div class="weapon-box">
            <div class="weapon-box-label">실제 효과</div>
            <div class="weapon-box-title">수사 착수 = 추심 중단</div>
            <div class="weapon-box-content">
              <ul>
                <li><strong>수사 착수만으로 대부분 추심 중단</strong></li>
                <li>민사 손해배상 청구 병행 가능</li>
                <li>전국 261개 전담수사팀 운영 중</li>
                <li>신고포상금 최대 <strong>5천만 원</strong></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="weapon-footer">신고만으로 상대방이 도망가는 경우 · <strong>매우 많음</strong></div>
      </div>

    </div>

    <div class="strategy-box">
      <div class="strategy-title">상황에 맞는 대응 전략을 설계합니다</div>
      <div class="strategy-items">
        <div class="strategy-item">
          <span class="situation">추심 강도가 극심할 때</span>
          <span class="combination">WEAPON 01 + 03</span>
        </div>
        <div class="strategy-item">
          <span class="situation">원금 이상 상환했을 때</span>
          <span class="combination">WEAPON 02 환수 우선</span>
        </div>
        <div class="strategy-item">
          <span class="situation">가족 연락·사진 협박</span>
          <span class="combination">WEAPON 01 + 03 병합</span>
        </div>
      </div>
      <div class="strategy-cta">
        <div class="strategy-cta-text">
          어떤 조합이 당신에게 맞는지, <strong>1분 진단</strong>으로 확인됩니다.
        </div>
        <button type="button" class="btn-primary js-open-diagnosis" data-source="stats">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          내 무기 확인 · 1분 무료 진단
        </button>
      </div>
    </div>
  </div>
</section>

<!-- ================= CASES ================= -->
<section class="cases">
  <div class="container">
    <div class="cases-header">
      <div class="section-label">REAL CASES</div>
      <h2 class="section-title">
        실제 숫자로 보는<br>
        <span style="color: var(--gold);">해결 케이스</span>
      </h2>
      <p class="section-sub">— 실제 대응 사례. 개인정보 보호를 위해 익명 처리 —</p>
    </div>

    <div class="cases-grid">

      <div class="case-card">
        <div class="case-header">
          <div class="case-num">— CASE 01</div>
          <div class="case-profile">30대 직장인 A씨<span class="region">· 서울</span></div>
        </div>
        <div class="case-stats">
          <div class="case-stat-row">
            <span class="label">원금 대여액</span>
            <span class="value">500만원</span>
          </div>
          <div class="case-stat-row">
            <span class="label">실제 상환 총액</span>
            <span class="value">1,400만원</span>
          </div>
          <div class="case-stat-row">
            <span class="label">적용 이자율</span>
            <span class="value" style="color: var(--crimson-bright);">연 180%</span>
          </div>
          <div class="case-stat-row highlight">
            <span class="label">환수 검토 금액</span>
            <span class="value">900만원</span>
          </div>
        </div>
        <div class="case-meta">
          <div class="case-meta-row">
            <span class="meta-label">대응 기간</span>
            <span class="meta-value">약 2개월</span>
          </div>
          <div class="case-meta-row" style="align-items: flex-start;">
            <span class="meta-label">사용 무기</span>
            <span class="meta-value" style="display: flex; flex-wrap: wrap;">
              <span class="case-weapon-tag">W02 계약 무효</span>
              <span class="case-weapon-tag">환수 청구</span>
            </span>
          </div>
        </div>
        <div class="case-outcome">
          초과 상환분 계산 후 <strong>금감원 무효확인서 발급</strong>. 추가 상환 의무 정지 및 환수 청구 진행.
        </div>
      </div>

      <div class="case-card">
        <div class="case-header">
          <div class="case-num">— CASE 02</div>
          <div class="case-profile">40대 자영업자 B씨<span class="region">· 경기</span></div>
        </div>
        <div class="case-stats">
          <div class="case-stat-row">
            <span class="label">피해 유형</span>
            <span class="value">복합 추심</span>
          </div>
          <div class="case-stat-row">
            <span class="label">지속 기간</span>
            <span class="value">3개월 이상</span>
          </div>
          <div class="case-stat-row">
            <span class="label">특이 사항</span>
            <span class="value" style="color: var(--crimson-bright);">사진 협박</span>
          </div>
          <div class="case-stat-row highlight">
            <span class="label">결과</span>
            <span class="value" style="font-size: 14px;">추심 중단 · 형사 고소</span>
          </div>
        </div>
        <div class="case-meta">
          <div class="case-meta-row">
            <span class="meta-label">대응 기간</span>
            <span class="meta-value">2주</span>
          </div>
          <div class="case-meta-row" style="align-items: flex-start;">
            <span class="meta-label">사용 무기</span>
            <span class="meta-value" style="display: flex; flex-wrap: wrap;">
              <span class="case-weapon-tag">W01 연락 차단</span>
              <span class="case-weapon-tag">W03 형사 고소</span>
            </span>
          </div>
        </div>
        <div class="case-outcome">
          서면 통지 후 <strong>추심 즉시 중단</strong>. 채권추심법·협박죄·성폭력처벌법 병합 고소.
        </div>
      </div>

      <div class="case-card">
        <div class="case-header">
          <div class="case-num">— CASE 03</div>
          <div class="case-profile">20대 사회초년생 C씨<span class="region">· 부산</span></div>
        </div>
        <div class="case-stats">
          <div class="case-stat-row">
            <span class="label">원금 대여액</span>
            <span class="value">100만원</span>
          </div>
          <div class="case-stat-row">
            <span class="label">실제 상환 총액</span>
            <span class="value">320만원</span>
          </div>
          <div class="case-stat-row">
            <span class="label">적용 이자율</span>
            <span class="value" style="color: var(--crimson-bright);">연 240%</span>
          </div>
          <div class="case-stat-row highlight">
            <span class="label">결과</span>
            <span class="value" style="font-size: 14px;">상환 의무 0원</span>
          </div>
        </div>
        <div class="case-meta">
          <div class="case-meta-row">
            <span class="meta-label">증거 상황</span>
            <span class="meta-value">카톡 일부만 보유</span>
          </div>
          <div class="case-meta-row" style="align-items: flex-start;">
            <span class="meta-label">사용 무기</span>
            <span class="meta-value" style="display: flex; flex-wrap: wrap;">
              <span class="case-weapon-tag">W02 계약 무효</span>
            </span>
          </div>
        </div>
        <div class="case-outcome">
          증거 복원 후 <strong>연 60% 초과 계약 무효 확정</strong>. 대부업법 제8조의2에 따라 상환 의무 소멸.
        </div>
      </div>

    </div>

    <div class="cases-warning">
      <div class="warn-icon">⚠</div>
      <div class="cases-warning-text">
        <strong>대응이 늦어질수록 환수 가능 금액은 줄어듭니다.</strong><br>
        증거는 시간이 지나면 사라지고, 추심은 시간이 지나면 강해집니다.
      </div>
    </div>

    <div class="cases-cta">
      <button type="button" class="btn-primary js-open-diagnosis" data-source="cases" style="padding: 20px 36px; font-size: 15.5px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
        내 환수 가능액 무료로 계산
      </button>
      <a href="__KAKAO_LINK__" target="_blank" rel="noreferrer" class="btn-secondary js-kakao-cta" data-source="cases">카카오톡으로 물어보기</a>
    </div>

    <div class="cases-footnote">
      ※ 위 사례는 실제 대응을 바탕으로 익명 처리되었습니다.<br>
      개별 사안은 구체적 사실관계에 따라 달라질 수 있습니다.
    </div>
  </div>
</section>

<!-- ================= CORE POINTS ================= -->
<section class="core-points">
  <div class="container">
    <div class="section-label">CORE POINTS</div>
    <h2 class="section-title">
      사채 피해자의<br>
      <span style="color: var(--gold);">안전과 피해회복</span>에 집중합니다.
    </h2>
    <p class="section-sub">— 사채업자는 정식 로펌을 두려워합니다 —</p>

    <div class="core-grid">
      <div class="core-card">
        <div class="core-num">— 01</div>
        <h3>추심 방식 확인</h3>
        <p>욕설·협박·반복 연락·가족 연락 여부를 시간순으로 정리합니다. 어떤 추심이 있었는지 구체적으로 기록하는 것부터가 시작입니다.</p>
        <div class="core-benefit">불법 추심이 확인되면 형사 대응 근거가 됩니다.</div>
      </div>
      <div class="core-card">
        <div class="core-num">— 02</div>
        <h3>상환 구조 확인</h3>
        <p>원금·이자율·실제 상환 총액을 법정 기준과 비교합니다. 얼마를 빌렸고 얼마를 갚았는지 숫자로 명확히 파악합니다.</p>
        <div class="core-benefit">연 20% 초과분은 원칙적으로 환수 대상입니다.</div>
      </div>
      <div class="core-card">
        <div class="core-num">— 03</div>
        <h3>증거 보존 정리</h3>
        <p>통화기록·문자·카톡·녹취·캡처를 체계적으로 분류합니다. 흩어진 자료를 법적으로 쓸 수 있는 형태로 묶어냅니다.</p>
        <div class="core-benefit">대응·합의·신고 모든 단계의 핵심 자료입니다.</div>
      </div>
    </div>
  </div>
</section>

<!-- ================= CHECKLIST DUO ================= -->
<section class="checklist-duo">
  <div class="container">
    <div style="text-align: center; margin-bottom: 10px;">
      <div class="section-label">CHECKLIST</div>
      <h2 class="section-title">상담 전, 두 가지만 확인해주세요</h2>
    </div>

    <div class="duo-grid" style="margin-top: 52px;">
      <div class="duo-card signal">
        <div class="duo-label">SIGNAL</div>
        <h3 class="duo-title">이런 신호가 보이면,<br>더 늦기 전에</h3>
        <ul class="duo-list">
          <li class="duo-item"><span class="duo-bullet"></span>밤낮 없이 연락이 반복된다</li>
          <li class="duo-item"><span class="duo-bullet"></span>지인·직장에 연락하겠다고 한다</li>
          <li class="duo-item"><span class="duo-bullet"></span>이미 원금 이상을 갚은 것 같다</li>
          <li class="duo-item warning"><span class="duo-bullet"></span>대화 내용을 지우고 싶어진다 <span class="warn-tag">지우지 마세요</span></li>
          <li class="duo-item"><span class="duo-bullet"></span>약속한 조건과 계속 달라진다</li>
        </ul>
        <div class="duo-footer">
          <strong>→</strong> 2개 이상 해당되면, 불법 추심 가능성이 높습니다.
        </div>
      </div>

      <div class="duo-card">
        <div class="duo-label">PREPARE</div>
        <h3 class="duo-title">상담 전,<br>이것만 남겨두세요</h3>
        <ul class="duo-list">
          <li class="duo-item"><span class="duo-bullet"></span>입출금 내역 캡처 (원금·이자 구분)</li>
          <li class="duo-item"><span class="duo-bullet"></span>문자·카톡 대화 전체 캡처</li>
          <li class="duo-item"><span class="duo-bullet"></span>통화 녹음 파일</li>
          <li class="duo-item"><span class="duo-bullet"></span>상대방 계좌번호·닉네임·전화번호</li>
          <li class="duo-item"><span class="duo-bullet"></span>차용증·계약서 사진 (있다면)</li>
        </ul>
        <div class="duo-footer">
          <strong>→</strong> 없어도 상담 가능합니다. 있는 것부터 보내주세요.
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= PROCESS ================= -->
<section class="process">
  <div class="container">
    <div class="section-label">PROCESS FLOW</div>
    <h2 class="section-title">
      상담은 이렇게<br>
      진행됩니다.
    </h2>
    <p class="section-sub">— 첫 상담부터 결과까지, 변호사가 모든 단계에 함께합니다 —</p>

    <div class="process-wrap">
      <div class="steps-grid">
        <div class="step">
          <div class="step-num">STEP 01</div>
          <h4>피해 상황 확인</h4>
          <p>카카오톡으로 정황 공유<br>변호사 1차 검토 <strong>(무료)</strong></p>
        </div>
        <div class="step">
          <div class="step-num">STEP 02</div>
          <h4>증거 자료 정리</h4>
          <p>남아있는 자료 기준<br>불법성 판단 · 분류</p>
        </div>
        <div class="step">
          <div class="step-num">STEP 03</div>
          <h4>대응 방향 검토</h4>
          <p>형사 / 합의 / 환수<br>최적 전략 설계</p>
        </div>
        <div class="step">
          <div class="step-num">STEP 04</div>
          <h4>환수 가능성 검토</h4>
          <p>초과 상환분이 있다면<br>회수 절차 진행</p>
        </div>
      </div>
      <div class="process-cta">
        <button type="button" class="btn-primary js-open-diagnosis" data-source="process">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          1분 무료 진단 시작
        </button>
        <a href="__KAKAO_LINK__" target="_blank" rel="noreferrer" class="btn-secondary js-kakao-cta" data-source="process">카카오톡 상담</a>
      </div>
    </div>
  </div>
</section>

<!-- ================= FAQ ================= -->
<section class="faq">
  <div class="container">
    <div style="text-align: center;">
      <div class="section-label">FREQUENTLY ASKED</div>
      <h2 class="section-title">
        <span style="color: var(--gold);">자주 하는</span> 질문
      </h2>
    </div>

    <div class="faq-list">
      <div class="faq-item featured">
        <div class="faq-q">상담하면 채권자에게 알려지지 않나요?</div>
        <div class="faq-a">
          <strong>절대 알려지지 않습니다.</strong> 변호사는 법으로 비밀유지 의무가 있으며, 상담 단계에서는 어떠한 대외 연락도 발생하지 않습니다. 의뢰인의 동의 없이는 다음 단계로 진행되지 않습니다.
        </div>
        <div class="faq-law">📎 근거: 변호사법 제26조 (비밀유지의무)</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">LawGuard는 진짜 변호사가 하는 건가요?</div>
        <div class="faq-a">
          LawGuard는 <strong>매일법률사무소(대표변호사 김민석)</strong>가 운영하는 불법사채 전담 법률 서비스입니다. 상담·서류 검토·대응 전략 수립까지 모두 변호사가 직접 진행하며, 매일법률사무소 정식 사건으로 수임됩니다. "○○센터", "○○지원단" 같은 비변호사 업체와는 구조가 다릅니다.
        </div>
        <div class="faq-law">📎 사업자등록번호 489-04-02780</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">이미 꽤 많이 갚았는데도 계속 돈을 요구합니다.</div>
        <div class="faq-a">
          원금과 실제 상환 총액을 먼저 정리해보는 것이 중요합니다. <strong>연 20%(법정 최고이자율)를 초과한 상환분은 원칙적으로 무효</strong>이며, 환수를 검토할 수 있습니다.
        </div>
        <div class="faq-law">📎 근거: 이자제한법 제2조, 대부업법 제8조</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">가족이나 직장으로 연락이 간 상태입니다.</div>
        <div class="faq-a">
          이 경우는 대응 속도가 중요합니다. <strong>제3자에 대한 연락은 채권추심법 위반으로 형사 처벌 대상</strong>입니다. 연락 정황·캡처·통화기록을 남기고 빠르게 상담해주세요.
        </div>
        <div class="faq-law">📎 근거: 채권추심법 제9조 제6호·제7호</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">증거가 조금밖에 없어도 상담이 가능한가요?</div>
        <div class="faq-a">
          가능합니다. 계좌내역·문자·카톡·통화기록 중 남아 있는 것을 최대한 보존해두시면 됩니다. 없는 자료는 법적 절차를 통해 확보 가능한 경우도 많습니다.
        </div>
      </div>

      <div class="faq-item">
        <div class="faq-q">상담료는 어떻게 되나요?</div>
        <div class="faq-a">
          <strong>모든 상담은 무료</strong>입니다. 피해 상황을 검토한 후 대응이 필요한 경우에만 수임 여부와 비용을 투명하게 안내드립니다.
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= FOOTER CTA ================= -->
<section class="footer-cta">
  <div class="container">
    <div class="footer-ornament">— LawGuard × 매일법률사무소 —</div>
    <h2 class="footer-title">
      불법사채·불법추심 대응 상담
    </h2>
    <div class="footer-info footer-business-info">
      상호명: 매일법률사무소 | 대표자: 김민석 | 사업자등록번호: 489-04-02780<br>
      주소: 서울특별시 서초구 서초대로42길 66 매일빌딩<br>
      광고책임자: 김민석 변호사 | 이메일: doublestone.partners@gmail.com
    </div>
    <div class="final-cta">
      <button type="button" class="btn-primary js-open-diagnosis" data-source="footer" style="padding: 20px 40px; font-size: 15.5px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
        1분 무료 진단 시작
      </button>
      <a href="__KAKAO_LINK__" target="_blank" rel="noreferrer" class="btn-secondary js-kakao-cta" data-source="footer" style="padding: 20px 32px; font-size: 15.5px;">카카오톡 상담</a>
    </div>
    <div class="footer-meta">
      © LawGuard. 본 페이지의 법률 정보는 일반적 안내이며, 구체적 상담은 변호사와 진행하시기 바랍니다.
    </div>
  </div>
</section>

<!-- ================= MOBILE STICKY CTA ================= -->
<div class="sticky-cta">
  <button type="button" class="btn-primary js-open-diagnosis" data-source="sticky">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
    1분 무료 진단
  </button>
  <a href="__KAKAO_LINK__" target="_blank" rel="noreferrer" class="btn-secondary js-kakao-cta" data-source="sticky">카톡</a>
</div>`;

const DAMAGE_TYPES = [
  "불법사채",
  "불법추심",
  "대리입금",
  "선이자·고금리 피해",
  "지인연락·직장연락 피해",
  "기타",
];

const PRESSURE_LEVELS = [
  "연락은 있으나 심하지 않음",
  "반복 연락으로 스트레스가 큼",
  "욕설·협박성 연락이 있음",
  "가족·지인·직장에 연락함",
  "사진유포·신상유포 등 위협이 있음",
];

const YES_NO = ["있음", "없음"];

const EVIDENCE_OPTIONS = [
  "계좌내역 있음",
  "문자·카톡 있음",
  "녹취 있음",
  "캡처 일부만 있음",
  "거의 없음",
];

const PRIVACY_POLICY_TEXT = `개인정보처리방침 안내

매일법률사무소(이하 "회사")는 관련 법령에 따라 개인정보를 처리합니다.

1. 수집항목
이름, 연락처, 상담내용, 접속기록

2. 이용목적
상담 접수, 사실관계 확인, 법률서비스 안내, 민원 응대

3. 보유기간
상담 목적 달성 후 지체 없이 파기하되, 관련 법령상 보존 의무가 있는 경우 해당 기간 동안 보관합니다.

4. 문의
매일법률사무소 / 02-6283-1100 / maeil@lawmaeil.com`;

const urgencyMessages = {
  low: {
    label: "초기 대응 단계",
    title: "지금부터 기록을 남기면 대응이 훨씬 유리합니다.",
    desc: "현재 단계에서는 증거 보존과 연락 대응 가이드만 제대로 잡아도 이후 절차가 훨씬 정리됩니다.",
  },
  medium: {
    label: "우선 상담 권장",
    title: "추심 강도가 올라가기 전에 대응 전략을 상담 받는 것이 좋습니다.",
    desc: "상대방의 연락 방식과 상환 구조를 함께 검토해 두는 것이 안전합니다.",
  },
  high: {
    label: "긴급 대응 필요",
    title: "주변인 연락·협박 정황이 있다면 빠른 법률 대응이 중요합니다.",
    desc: "증거 확보, 대응 문구 정리, 합의 가능성 검토, 환수 가능성 확인을 서둘러 진행하는 편이 좋습니다.",
  },
};

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  return Number(String(value).replace(/[^0-9]/g, "") || 0);
}

function formatManwon(value) {
  return `${toNumber(value).toLocaleString("ko-KR")}만원`;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
}

function includesAny(values, targets) {
  return normalizeArray(values).some((value) => targets.includes(value));
}

function formatJoined(values, emptyText) {
  const list = normalizeArray(values);
  return list.length ? list.join(", ") : emptyText;
}

function getDiagnosisPayload(form) {
  const principal = toNumber(form.loanAmount);
  const repaid = toNumber(form.repaidAmount);
  const overpaid = Math.max(0, repaid - principal);
  const damageTypes = normalizeArray(form.damageTypes);
  const pressureLevels = normalizeArray(form.pressureLevels);
  const evidenceItems = normalizeArray(form.evidenceItems);

  let score = 0;

  if (includesAny(damageTypes, ["불법사채", "대리입금", "선이자·고금리 피해"])) {
    score += 2;
  }

  if (
    includesAny(pressureLevels, [
      "욕설·협박성 연락이 있음",
      "가족·지인·직장에 연락함",
      "사진유포·신상유포 등 위협이 있음",
    ])
  ) {
    score += 3;
  }

  if (evidenceItems.length > 0 && !evidenceItems.includes("거의 없음")) {
    score += 2;
  }

  if (form.spreadDamage === "있음") {
    score += 3;
  }

  if (overpaid > 0) {
    score += 2;
  }

  const urgency = score >= 8 ? "high" : score >= 4 ? "medium" : "low";

  const actionItems = [];
  if (evidenceItems.length > 0 && !evidenceItems.includes("거의 없음")) {
    actionItems.push("증거 보존 및 정리");
  }
  if (form.spreadDamage === "있음") {
    actionItems.push("주변인 연락·명예훼손 대응 검토");
  }
  if (pressureLevels.includes("사진유포·신상유포 등 위협이 있음")) {
    actionItems.push("긴급 위협 대응 및 신고 검토");
  }
  if (overpaid > 0) {
    actionItems.push("초과 상환분 환수 가능성 검토");
  }
  actionItems.push("합의 가능성 및 대응 문구 정리");

  return {
    damageTypes,
    pressureLevels,
    evidenceItems,
    damageType: formatJoined(damageTypes, "피해유형 미선택"),
    pressureLevel: formatJoined(pressureLevels, "추심단계 미선택"),
    evidence: formatJoined(evidenceItems, "미선택"),
    loanAmount: principal,
    repaidAmount: repaid,
    spreadDamage: form.spreadDamage,
    overpaidAmount: overpaid,
    urgency,
    actionItems,
    summary: `${formatJoined(damageTypes, "피해유형 미선택")} / ${formatJoined(
      pressureLevels,
      "추심단계 미선택"
    )} / 증거 ${formatJoined(evidenceItems, "미선택")}`,
  };
}

function getCurrentStepValid(step, form) {
  if (step === 1) return normalizeArray(form.damageTypes).length > 0;
  if (step === 2) return normalizeArray(form.pressureLevels).length > 0;
  if (step === 3) return true;
  if (step === 4) return true;
  if (step === 5) return normalizeArray(form.evidenceItems).length > 0;
  if (step === 6) return !!form.spreadDamage;
  return true;
}

export default function Page() {
  const containerRef = useRef(null);
  const posthogInitialized = useRef(false);
  const diagnosisSourceRef = useRef("unknown");

  const kakaoLink = process.env.NEXT_PUBLIC_KAKAO_LINK || DEFAULT_KAKAO_LINK;
  const lawfirmLink = process.env.NEXT_PUBLIC_LAWFIRM_LINK || DEFAULT_LAWFIRM_SITE_LINK;
  const cafeLink = process.env.NEXT_PUBLIC_NAVER_CAFE_LINK || DEFAULT_NAVER_CAFE_LINK;

  const landingHtml = useMemo(
    () => buildLandingHtml({ kakaoLink, lawfirmLink, cafeLink }),
    [kakaoLink, lawfirmLink, cafeLink]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [consultation, setConsultation] = useState({ name: "", phone: "" });

  const [form, setForm] = useState({
    damageType: ["기타"],
    pressureLevels: [],
    loanAmount: "",
    repaidAmount: "",
    evidenceItems: [],
    spreadDamage: "",
  });

  const diagnosis = useMemo(() => getDiagnosisPayload(form), [form]);
  const currentStepValid = getCurrentStepValid(step, form);
  const resultConfig = urgencyMessages[diagnosis.urgency];

  const safeCapture = (eventName, properties = {}) => {
    if (typeof window === "undefined") return;
    if (!posthogInitialized.current) return;
    try {
      posthog.capture(eventName, properties);
    } catch (error) {
      console.error("PostHog capture error:", error);
    }
  };

  const trackCtaClick = (ctaName, sectionId) => {
    safeCapture("landing cta clicked", {
      cta_name: ctaName,
      section_id: sectionId,
      current_url: typeof window !== "undefined" ? window.location.pathname : "",
    });
  };

  useEffect(() => {
  const node = containerRef.current;
  if (!node) return;

  const onContainerClick = (event) => {
    const diagnosisButton = event.target.closest(".js-open-diagnosis");
    if (diagnosisButton) {
      event.preventDefault();
      const source = diagnosisButton.getAttribute("data-source") || "unknown";
      trackCtaClick("diagnosis_start", source);
      openDiagnosisModal(source);
      return;
    }

    const kakaoAnchor = event.target.closest(".js-kakao-cta");
    if (kakaoAnchor) {
      const source = kakaoAnchor.getAttribute("data-source") || "unknown";
      trackCtaClick("kakao_consult", source);
    }
  };

  node.addEventListener("click", onContainerClick);

  return () => {
    node.removeEventListener("click", onContainerClick);
  };
}, []);

  const openDiagnosisModal = (sourceSection = "unknown") => {
    diagnosisSourceRef.current = sourceSection;

    safeCapture("diagnosis started", {
      source: sourceSection,
      current_url: typeof window !== "undefined" ? window.location.pathname : "",
    });

    setForm({
      damageType: ["기타"],
      pressureLevels: [],
      loanAmount: "",
      repaidAmount: "",
      evidenceItems: [],
      spreadDamage: "",
    });
    setConsultation({ name: "", phone: "" });
    setSubmitMessage("");
    setPrivacyAgreed(false);
    setPrivacyOpen(false);
    setProgress(0);
    setStep(2);
    setIsModalOpen(true);
  };

  const closeDiagnosisModal = () => {
    safeCapture("diagnosis closed", {
      current_step: step,
      source: diagnosisSourceRef.current,
    });
    setIsModalOpen(false);
    setStep(2);
    setProgress(0);
    setSubmitMessage("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const diagnosisButtons = Array.from(node.querySelectorAll(".js-open-diagnosis"));
    const kakaoAnchors = Array.from(node.querySelectorAll(".js-kakao-cta"));

    const onDiagnosisClick = (event) => {
      event.preventDefault();
      const source = event.currentTarget.getAttribute("data-source") || "unknown";
      trackCtaClick("diagnosis_start", source);
      openDiagnosisModal(source);
    };

    const onKakaoClick = (event) => {
      const source = event.currentTarget.getAttribute("data-source") || "unknown";
      trackCtaClick("kakao_consult", source);
    };

    diagnosisButtons.forEach((button) => button.addEventListener("click", onDiagnosisClick));
    kakaoAnchors.forEach((anchor) => anchor.addEventListener("click", onKakaoClick));

    return () => {
      diagnosisButtons.forEach((button) => button.removeEventListener("click", onDiagnosisClick));
      kakaoAnchors.forEach((anchor) => anchor.removeEventListener("click", onKakaoClick));
    };
  }, [landingHtml]);

  useEffect(() => {
    if (!isModalOpen || step !== 7) return;

    setProgress(0);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setStep(8), 350);
          return 100;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [isModalOpen, step]);

  useEffect(() => {
    if (step === 8) {
      safeCapture("diagnosis result viewed", {
        source: diagnosisSourceRef.current,
        urgency: diagnosis.urgency,
        overpaid_amount: diagnosis.overpaidAmount,
      });
    }
  }, [step, diagnosis]);

  const nextStep = () => {
    safeCapture("diagnosis step completed", {
      step_number: step,
      source: diagnosisSourceRef.current,
    });

    if (step < 6) {
      setStep((prev) => prev + 1);
      return;
    }

    if (step === 6) {
      setStep(7);
    }
  };

  const prevStep = () => {
    if (step > 2 && step < 7) {
      safeCapture("diagnosis step back", {
        step_number: step,
        source: diagnosisSourceRef.current,
      });
      setStep((prev) => prev - 1);
    }
  };

 const handleConsultSubmit = async (e) => {
  e.preventDefault();

  if (!consultation.name.trim() || !consultation.phone.trim()) {
    setSubmitMessage("이름과 연락처를 입력해주세요.");
    return;
  }

  if (!privacyAgreed) {
    setSubmitMessage("개인정보처리방침에 동의해주세요.");
    return;
  }

  try {
    setIsSubmitting(true);
    setSubmitMessage("");

    const eventId =
      typeof window !== "undefined" && window.crypto?.randomUUID
        ? `contact_${window.crypto.randomUUID()}`
        : `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const response = await fetch("/api/consultation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId,
        applicant: consultation,
        privacyAgreed,
        diagnosis,
        source: diagnosisSourceRef.current,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "상담 신청 전송에 실패했습니다.");
    }

    // 구글시트 저장 성공 후 브라우저 Pixel Contact 이벤트 전송
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Contact", {}, { eventID: eventId });
    }

    // 기존 분석도구 사용 중이면 유지
    if (typeof safeCapture === "function") {
      safeCapture("consultation submitted", {
        source: "illegal_loan_result",
        diagnosis_source: diagnosisSourceRef.current,
        urgency: diagnosis?.urgency,
        event_id: eventId,
      });
    }

    setSubmitMessage("상담 신청이 정상적으로 접수되었습니다.");
    setConsultation({ name: "", phone: "" });
    setPrivacyAgreed(false);
    setPrivacyOpen(false);
  } catch (error) {
    console.error("상담신청 전송 오류:", error);
    setSubmitMessage(error.message || "신청 전송 중 오류가 발생했습니다.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <main ref={containerRef}>
        <div dangerouslySetInnerHTML={{ __html: landingHtml }} />
      </main>

      {isModalOpen && (
        <div className="lg-modal-overlay" onClick={closeDiagnosisModal}>
          <div className="lg-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lg-modal-close" onClick={closeDiagnosisModal} aria-label="닫기">
              ×
            </button>

            {step <= 6 && (
              <div>
                <div className="lg-modal-head">
                  <div>
                    <p className="lg-modal-eyebrow">LAWGUARD DIAGNOSIS</p>
                    <h3 className="lg-modal-title">피해상황 1분 진단</h3>
                  </div>
                  <div className="lg-modal-step">{step -1} / 7</div>
                </div>

                <div className="lg-modal-progress">
                  <div style={{ width: `${((step - 1) / 7) * 100}%` }} />
                </div>

                {step === 2 && (
                  <div className="lg-step-block">
                    <h4>현재 추심 상황을 말씀해주세요.</h4>
                    <p>해당하는 사항을 모두 선택 해주세요.</p>
                    <div className="lg-step-grid">
                      {PRESSURE_LEVELS.map((option) => (
                        <StepChoice
                          key={option}
                          multiple
                          selected={form.pressureLevels.includes(option)}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              pressureLevels: toggleSelection(prev.pressureLevels, option),
                            }))
                          }
                        >
                          {option}
                        </StepChoice>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="lg-step-block">
                    <h4>대여받은 원금은 어느 정도인가요?</h4>
                    <p>정확하지 않아도 대략적인 금액이면 충분합니다.</p>
                    <div className="lg-field-card">
                      <label>대여 원금</label>
                      <div className="lg-input-wrap">
                        <input
                          value={form.loanAmount}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              loanAmount: e.target.value.replace(/[^0-9]/g, ""),
                            }))
                          }
                          inputMode="numeric"
                          placeholder="예: 300"
                        />
                        <span>만원</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="lg-step-block">
                    <h4>지금까지 실제로 상환한 총액은 어느 정도인가요?</h4>
                    <p>이 역시 대략적인 금액이면 충분합니다.</p>
                    <div className="lg-field-card">
                      <label>상환 총액</label>
                      <div className="lg-input-wrap">
                        <input
                          value={form.repaidAmount}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              repaidAmount: e.target.value.replace(/[^0-9]/g, ""),
                            }))
                          }
                          inputMode="numeric"
                          placeholder="예: 540"
                        />
                        <span>만원</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="lg-step-block">
                    <h4>현재 남아 있는 증거는 어떤 편인가요?</h4>
                    <p>해당하는 사항을 모두 선택 해주세요.</p>
                    <div className="lg-step-grid">
                      {EVIDENCE_OPTIONS.map((option) => (
                        <StepChoice
                          key={option}
                          multiple
                          selected={form.evidenceItems.includes(option)}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              evidenceItems: toggleSelection(prev.evidenceItems, option),
                            }))
                          }
                        >
                          {option}
                        </StepChoice>
                      ))}
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="lg-step-block">
                    <h4>가족·지인·직장으로 연락이 갔거나 갈 우려가 있나요?</h4>
                    <p>현재 가장 가까운 상태를 선택해주세요.</p>
                    <div className="lg-step-grid lg-step-grid--two">
                      {YES_NO.map((option) => (
                        <StepChoice
                          key={option}
                          selected={form.spreadDamage === option}
                          onClick={() => setForm((prev) => ({ ...prev, spreadDamage: option }))}
                        >
                          {option}
                        </StepChoice>
                      ))}
                    </div>
                  </div>
                )}

                <div className="lg-modal-actions">
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`lg-modal-nav lg-modal-nav--secondary${step === 1 ? " is-disabled" : ""}`}
                    disabled={step === 1}
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`lg-modal-nav lg-modal-nav--primary${!currentStepValid ? " is-disabled" : ""}`}
                    disabled={!currentStepValid}
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="lg-loading-state">
                <p className="lg-modal-eyebrow">ANALYZING</p>
                <h3 className="lg-modal-title">입력하신 피해 상황을 정리하고 있습니다.</h3>
                <ProgressRing progress={progress} />
                <p className="lg-loading-copy">
                  불법 추심 강도, 상환 구조, 증거 보유 상태를 바탕으로 상담 우선순위를 정리하고 있습니다.
                </p>
              </div>
            )}

            {step === 8 && (
              <div className="lg-result-state">
                <p className="lg-modal-eyebrow">ANALYSIS RESULT</p>
                <h3 className="lg-modal-title">{resultConfig.title}</h3>
                <p className="lg-result-copy">{resultConfig.desc}</p>

                <div className="lg-result-grid">
                  <div className="lg-result-card">
                    <span>긴급도</span>
                    <strong>{resultConfig.label}</strong>
                  </div>
                  <div className="lg-result-card">
                    <span>원금</span>
                    <strong>{formatManwon(diagnosis.loanAmount)}</strong>
                  </div>
                  <div className="lg-result-card">
                    <span>초과 상환 추정</span>
                    <strong className="is-gold">{formatManwon(diagnosis.overpaidAmount)}</strong>
                  </div>
                </div>

                <div className="lg-result-actions-card">
                  <p>우선 검토 항목</p>
                  <div className="lg-action-list">
                    {diagnosis.actionItems.map((item) => (
                      <div key={item} className="lg-action-item">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleConsultSubmit} className="lg-consult-form">
                  <p className="lg-consult-form__eyebrow">상담 신청</p>
                  <h4 className="lg-consult-form__title">
                    지금 상담을 남겨주시면
                    <br />
                    확인 후 빠르게 연락드리겠습니다.
                  </h4>

                  <div className="lg-form-grid">
                    <div className="lg-form-field">
                      <label>이름</label>
                      <input
                        value={consultation.name}
                        onChange={(e) =>
                          setConsultation((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="성함을 입력해주세요"
                      />
                    </div>
                    <div className="lg-form-field">
                      <label>연락처</label>
                      <input
                        value={consultation.phone}
                        onChange={(e) =>
                          setConsultation((prev) => ({
                            ...prev,
                            phone: e.target.value.replace(/[^0-9-]/g, ""),
                          }))
                        }
                        placeholder="010-0000-0000"
                      />
                    </div>
                  </div>

                  <div className="lg-summary-box">
                    <strong>요약</strong>
                    <p>{diagnosis.summary}</p>
                  </div>

                  <label className="lg-privacy-line">
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    />
                    <span>
                      개인정보 수집 및 이용에 동의합니다.
                      <button
                        type="button"
                        onClick={() => setPrivacyOpen((prev) => !prev)}
                        className="lg-privacy-toggle"
                      >
                        {privacyOpen ? "닫기" : "전문보기"}
                      </button>
                    </span>
                  </label>

                  {privacyOpen && (
                    <div className="lg-privacy-box">{PRIVACY_POLICY_TEXT}</div>
                  )}

                  {submitMessage && <p className="lg-submit-message">{submitMessage}</p>}

                  <button type="submit" className="lg-submit-button" disabled={isSubmitting}>
                    {isSubmitting ? "접수 중입니다..." : "상담 신청하기"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}