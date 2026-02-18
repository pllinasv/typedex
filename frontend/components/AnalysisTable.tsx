import TypeBadgeIcon from "@/components/TypeBadgeIcon";
import { TypeCoverageRow } from "@/lib/types";

type AnalysisTableProps = {
  rows: TypeCoverageRow[];
};

export default function AnalysisTable({ rows }: AnalysisTableProps) {
  return (
    <section className="retro-panel p-4">
      <h2 className="retro-title mb-3 text-base">Type Defense Coverage</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-lg">
          <thead>
            <tr className="retro-table-head">
              <th className="px-2 py-2 font-semibold">Atk Type</th>
              <th className="px-2 py-2 font-semibold">Weak</th>
              <th className="px-2 py-2 font-semibold">Resist</th>
              <th className="px-2 py-2 font-semibold">Immune</th>
              <th className="px-2 py-2 font-semibold">Neutral</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.attacking_type} className="retro-row last:border-b-0">
                <td className="px-2 py-2 retro-text">
                  <div className="flex items-center gap-2">
                    <TypeBadgeIcon type={row.attacking_type} showLabel fixedWidth />
                  </div>
                </td>
                <td className="px-2 py-2 text-[#902e2e]">{row.weak}</td>
                <td className="px-2 py-2 text-[#2a6f2f]">{row.resist}</td>
                <td className="px-2 py-2 text-[#245f8a]">{row.immune}</td>
                <td className="px-2 py-2 retro-subtext">{row.neutral}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
