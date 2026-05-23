import { notFound } from "next/navigation";
import { DbDetailEditor } from "@/components/common/DbDetailEditor";
import { getDbFiles } from "@/lib/data/files";
import { getDbNotes } from "@/lib/data/db-notes";
import { getHospital } from "@/lib/data/contacts";

export const dynamic = "force-dynamic";

export default async function HospitalDetail({
  params,
}: {
  params: { id: string };
}) {
  const [hospital, notes, files] = await Promise.all([
    getHospital(params.id),
    getDbNotes("HOSPITAL", params.id),
    getDbFiles("HOSPITAL", params.id),
  ]);

  if (!hospital) notFound();

  const row = hospital as any;

  return (
    <DbDetailEditor
      title={row.hospital_name || row.name || "병원 상세정보"}
      backHref="/admin/hospitals"
      tableName="hospitals"
      targetType="HOSPITAL"
      record={row}
      notes={notes}
      files={files}
      fields={[
        {
          name: "hospital_name",
          label: "병원명",
        },
        {
          name: "hospital_type",
          label: "병원유형",
          type: "select",
          options: [
            { label: "한의원", value: "한의원" },
            { label: "정형외과", value: "정형외과" },
            { label: "신경외과", value: "신경외과" },
            { label: "재활의학과", value: "재활의학과" },
            { label: "통증의학과", value: "통증의학과" },
            { label: "기타", value: "기타" },
          ],
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
          name: "address",
          label: "주소",
        },
        {
          name: "internal_manager_name",
          label: "담당자",
        },
        {
          name: "status",
          label: "제휴상태",
          type: "select",
          options: [
            { label: "미계약", value: "미계약" },
            { label: "제안중", value: "제안중" },
            { label: "검토중", value: "검토중" },
            { label: "계약완료", value: "계약완료" },
            { label: "보류", value: "보류" },
            { label: "거절", value: "거절" },
          ],
        },
      ]}
    />
  );
}