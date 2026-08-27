import crypto from "crypto";
const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;

function sha256(value) {
  if (!value) return undefined;

  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

function normalizePhone(phone) {
  if (!phone) return undefined;

  let digits = String(phone).replace(/\D/g, "");

  // 01012345678 → 821012345678
  if (digits.startsWith("010")) {
    digits = `82${digits.slice(1)}`;
  }

  return digits;
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [rawKey, ...rawValue] = cookie.trim().split("=");
    if (!rawKey) return acc;

    acc[rawKey] = decodeURIComponent(rawValue.join("=") || "");
    return acc;
  }, {});
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    undefined
  );
}

export async function sendMetaCapiEvent({
  request,
  eventId,
  eventName = "Contact",
  phone,
  email,
  sourceUrl,
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    console.warn("Meta CAPI 환경변수가 없습니다.");
    return { skipped: true };
  }

  const cookies = parseCookies(request.headers.get("cookie") || "");

  const fbp = cookies._fbp;
  const fbc = cookies._fbc;

  const normalizedPhone = normalizePhone(phone);

  const userData = {
    client_ip_address: getClientIp(request),
    client_user_agent: request.headers.get("user-agent") || undefined,
    fbp,
    fbc,
    ph: normalizedPhone ? [sha256(normalizedPhone)] : undefined,
    em: email ? [sha256(email)] : undefined,
  };

  Object.keys(userData).forEach((key) => {
    if (
      userData[key] === undefined ||
      userData[key] === "" ||
      (Array.isArray(userData[key]) && userData[key].length === 0)
    ) {
      delete userData[key];
    }
  });

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url:
          sourceUrl ||
          request.headers.get("referer") ||
          process.env.NEXT_PUBLIC_SITE_URL,
        user_data: userData,
        custom_data: {
          content_name: "불법사채 상담신청",
          content_category: "illegal_loan",
        },
      },
    ],
  };

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  const response = await fetch(
    `https://graph.facebook.com/v25.0/${pixelId}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Meta CAPI 전송 실패:", result);
    return { success: false, result };
  }

  console.log("Meta CAPI 전송 성공:", result);
  return { success: true, result };
}