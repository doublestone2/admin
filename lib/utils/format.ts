export function cn(...values: Array<string | false | undefined | null>) {
  return values.filter(Boolean).join(" ");
}

export function parseMoney(value: FormDataEntryValue | null): number | null {
  const raw = String(value || "").replaceAll(",", "").trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "number" ? value : Number(String(value).replaceAll(",", ""));
  if (!Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat("ko-KR").format(num);
}

export function cleanText(value: FormDataEntryValue | null): string {
  return String(value || "").trim();
}

export function normalizeLoginId(value: string): string {
  const trimmed = value.trim();
  return trimmed || `user_${Date.now()}`;
}

export function toInternalAuthEmail(loginOrEmail: string): string {
  const v = normalizeLoginId(loginOrEmail).toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return v;
  const safe = encodeURIComponent(v)
    .replaceAll("%", "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40) || `user${Date.now()}`;
  return `user_${safe}@traffic-admin.local`;
}

export function normalizePassword(password: string): string {
  const raw = password || "";
  if (raw.length >= 6) return raw;
  return `${raw}__Traffic2026`;
}

export function fileSizeLabel(size?: number | null): string {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
