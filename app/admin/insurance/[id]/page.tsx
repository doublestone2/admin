import { notFound } from "next/navigation";
import { DbDetailEditor } from "@/components/common/DbDetailEditor";
import { getDbFiles } from "@/lib/data/files";
import { getDbNotes } from "@/lib/data/db-notes";
import { getInsuranceContact } from "@/lib/data/contacts";

export const dynamic = "force-dynamic";

export default async function InsuranceDetail({
  params,
}: {
  params: { id: string };
}) {
  const [insurance, notes, files] = await Promise.all([
    getInsuranceContact(params.id),
    getDbNotes("INSURANCE", params.id),
    getDbFiles("INSURANCE", params.id),
  ]);

  if (!insurance) notFound();

  const row = insurance as any;

  return (
    <DbDetailEditor
      title={row.insurance_company || row.company_name || row.name || "보험사 상세정보"}
      backHref="/admin/insurance"
      tableName="insurance_contacts"
      targetType="INSURANCE"
      record={row}
      notes={notes}
      files={files}
      fields={[
        {
          name: "insurance_company",
          label: "보험사명",
        },
        {
          name: "manager_name",
          label: "담당자",
        },
        {
          name: "position",
          label: "직책",
        },
        {
          name: "phone",
          label: "연락처",
        },
      ]}
    />
  );
}