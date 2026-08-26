import { FileText, CheckCircle2, FileEdit, Eye } from "lucide-react";

// ---------- Shared helper (kept here since stats needs it; import this
// wherever else you need to format view counts) ----------
export function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

interface ArticleStatsProps {
  total: number;
  published: number;
  drafts: number;
  totalViews: number;
}

interface StatConfig {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export default function ArticleStats({
  total,
  published,
  drafts,
  totalViews,
}: ArticleStatsProps) {
  const stats: StatConfig[] = [
    {
      label: "Total",
      value: total,
      icon: FileText,
      iconBg: "#f1f2f4",
      iconColor: "#4b5563",
    },
    {
      label: "Published",
      value: published,
      icon: CheckCircle2,
      iconBg: "#e9f2ec",
      iconColor: "#11512a",
    },
    {
      label: "Drafts",
      value: drafts,
      icon: FileEdit,
      iconBg: "#fdf3e7",
      iconColor: "#a3690c",
    },
    {
      label: "Total views",
      value: formatViews(totalViews),
      icon: Eye,
      iconBg: "#fbedec",
      iconColor: "#680505",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-7">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: stat.iconBg }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: stat.iconColor }}
                strokeWidth={2.25}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                {stat.value}
              </div>

              <div className="text-xs text-gray-500">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}