import { notFound } from "next/navigation";
import { DbDetailEditor } from "@/components/common/DbDetailEditor";
import { getDbFiles } from "@/lib/data/files";
import { getDbNotes } from "@/lib/data/db-notes";
import { getPartnerCompany } from "@/lib/data/contacts";

export const dynamic = "force-dynamic";

export default async function PartnerDetail({
  params,
}: {
  params: { id: string };
}) {
  const [partner, notes, files] = await Promise.all([
    getPartnerCompany(params.id),
    getDbNotes("PARTNER", params.id),
    getDbFiles("PARTNER", params.id),
  ]);

  if (!partner) notFound();

  const row = partner as any;

  return (
    <DbDetailEditor
      title={row.company_name || row.name || "제휴업체 상세정보"}
      backHref="/admin/partners"
      tableName="partner_companies"
      targetType="PARTNER"
      record={row}
      notes={notes}
      files={files}
      fields={[
        {
          name: "company_name",
          label: "업체명",
        },
        {
          name: "region",
          label: "지역",
        },
        {
          name: "phone",
          label: "연락처",
        },
        {
          name: "contract_status",
          label: "제휴상태",
          type: "select",
          options: [
            { label: "제안중", value: "제안중" },
            { label: "검토중", value: "검토중" },
            { label: "계약완료", value: "계약완료" },
            { label: "보류", value: "보류" },
            { label: "거절", value: "거절" },
          ],
        },
        {
          name: "manager_name",
          label: "담당자",
        },
      ]}
    />
  );
}