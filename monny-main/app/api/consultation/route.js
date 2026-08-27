import { google } from "googleapis";
import { NextResponse } from "next/server";
import { sendMetaCapiEvent } from "../../../lib/meta-capi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toMultiline(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }
  return value || "";
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      applicant,
      diagnosis,
      privacyAgreed,
      eventId,
    } = body || {};

    const name = applicant?.name?.trim() || "";
    const phone = applicant?.phone?.trim() || "";
    const email = applicant?.email?.trim() || "";

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, message: "이름과 연락처는 필수입니다." },
        { status: 400 }
      );
    }

    if (!privacyAgreed) {
      return NextResponse.json(
        { ok: false, message: "개인정보처리방침 동의가 필요합니다." },
        { status: 400 }
      );
    }

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";

    // 기존 시트 저장은 그대로 유지하고, 동일 DB를 보조 시트에도 복제 저장합니다.
    // 환경변수를 별도로 지정하지 않아도 현재 지정된 "매일 DB" 시트를 사용합니다.
    const secondarySpreadsheetId =
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2 ||
      "12zSRuOTn7dzYrlqLZdVFkjHOc8O8bhASlXsUH54kZZA";
    const secondarySheetName =
      process.env.GOOGLE_SHEETS_SHEET_NAME_2 || "매일 DB";

    const missing = [];

    if (!clientEmail) missing.push("GOOGLE_CLIENT_EMAIL");
    if (!privateKeyRaw) missing.push("GOOGLE_PRIVATE_KEY");
    if (!spreadsheetId) missing.push("GOOGLE_SHEETS_SPREADSHEET_ID");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `누락된 환경변수: ${missing.join(", ")}`,
        },
        { status: 500 }
      );
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    /**
     * 불법사채 랜딩페이지 저장 컬럼
     * A 접수일시
     * B 이름
     * C 연락처
     * D 추심강도
     * E 대여원금
     * F 상환총액
     * G 증거보유
     * H 주변인피해
     */
    const row = [
      new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      name,
      phone,
      toMultiline(diagnosis?.pressureLevels),
      diagnosis?.loanAmount || 0,
      diagnosis?.repaidAmount || 0,
      toMultiline(diagnosis?.evidenceItems),
      diagnosis?.spreadDamage || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:H`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    // 보조 시트(매일 DB)에도 동일한 상담 DB를 복제 저장합니다.
    // 보조 시트 오류가 발생해도 기존 시트 접수는 성공으로 유지합니다.
    if (
      secondarySpreadsheetId &&
      (secondarySpreadsheetId !== spreadsheetId ||
        secondarySheetName !== sheetName)
    ) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: secondarySpreadsheetId,
          range: `${secondarySheetName}!A:H`,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: [row],
          },
        });
      } catch (secondarySheetError) {
        console.error("secondary google sheet append error:", secondarySheetError);
      }
    }

    // 구글시트 저장 성공 후 Meta CAPI 전송
    // CAPI 오류가 나도 상담신청 자체는 성공 처리
    try {
      console.log("Meta CAPI 호출 시작:", {
        eventId: eventId || `contact_${Date.now()}`,
        phone,
        pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
        hasToken: !!process.env.META_CAPI_ACCESS_TOKEN,
        hasTestCode: !!process.env.META_CAPI_TEST_EVENT_CODE,
      });

      const capiResult = await sendMetaCapiEvent({
        request: req,
        eventId: eventId || `contact_${Date.now()}`,
        eventName: "Contact",
        phone,
        email,
        sourceUrl:
          req.headers.get("referer") || process.env.NEXT_PUBLIC_SITE_URL,
      });

      console.log("Meta CAPI 결과:", capiResult);
    } catch (capiError) {
      console.error("Meta CAPI 전송 오류:", capiError);
    }

    return NextResponse.json({
      ok: true,
      message: "상담신청이 정상적으로 접수되었습니다.",
    });
  } catch (error) {
    console.error("consultation api error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "상담 접수 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}