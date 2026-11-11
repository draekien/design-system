import type { SampleRecord } from "@workspace/fixtures/records.ts"

export const worstRecords: ReadonlyArray<SampleRecord> = [
  {
    id: "REC-100004231",
    title:
      "Migrate every archived workspace's audit logs to the new retention store before the 31 December regulatory deadline, then delete the old storage buckets",
    status: "in-review",
    statusAge: "14 months",
    owner: "Maximiliana Wolfeschlegelsteinhausen-Bergerdorff",
    team: "Governance, Risk and Compliance, Asia Pacific and Japan",
    updated: "3 years ago",
    updatedAt: "2 Sept 2023, 08:00",
    updatedIso: "2023-09-02T08:00:00Z",
    summary:
      "Moves 1,284 archived workspaces' audit logs from the legacy cold-storage buckets to the retention store, verifies each checksum, keeps the legacy copies read-only for 30 days, then deletes them. Blocked until Legal signs off on the Japanese data-residency exemption and Finance approves the one-off transfer cost.",
  },
  {
    id: "REC-100004230",
    title: "billing-workspace-service-account-credential-rotation-runbook-v2-final-final",
    status: "draft",
    statusAge: "1 day",
    owner: "Jo",
    team: "SRE",
    updated: "just now",
    updatedAt: "15 Oct 2026, 11:12",
    updatedIso: "2026-10-15T11:12:00Z",
    summary: "https://example.com/runbooks/billing-workspace-service-account-credential-rotation",
  },
  {
    id: "REC-100004229",
    title: "第四季度访问权限审查与供应商合同续签及数据保留政策更新",
    status: "approved",
    statusAge: "3 days",
    owner: "李明",
    team: "亚太区合规团队",
    updated: "3 days ago",
    updatedAt: "12 Oct 2026, 10:00",
    updatedIso: "2026-10-12T10:00:00Z",
    summary: "确认计费与支持工作区的管理员角色，并更新归档工作区的审计日志保留期限。",
  },
  {
    id: "REC-100004228",
    title: "🔐 مراجعة صلاحيات الوصول الربع سنوية لمساحات عمل الفوترة والدعم",
    status: "in-review",
    statusAge: "5 days",
    owner: "نور الهدى",
    team: "فريق الأمن",
    updated: "5 days ago",
    updatedAt: "10 Oct 2026, 09:00",
    updatedIso: "2026-10-10T09:00:00Z",
    summary: "يؤكد من يملك أدوار المسؤول في مساحتي عمل الفوترة والدعم (REC-104).",
  },
]
