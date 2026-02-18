import Image from "next/image";
import { TypeCoverageRow } from "@/lib/types";

type AnalysisTableProps = {
  rows: TypeCoverageRow[];
};

const TYPE_ICON_BASE_URL = "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons";

const formatTypeName = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function AnalysisTable({ rows }: AnalysisTableProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Type Defense Coverage</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="px-2 py-2 font-semibold">Atk Type</th>
              <th className="px-2 py-2 font-semibold">Weak</th>
              <th className="px-2 py-2 font-semibold">Resist</th>
              <th className="px-2 py-2 font-semibold">Immune</th>
              <th className="px-2 py-2 font-semibold">Neutral</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.attacking_type} className="border-b border-slate-100 last:border-b-0">
                <td className="px-2 py-2 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <Image
                      src={`${TYPE_ICON_BASE_URL}/${row.attacking_type}.svg`}
                      alt={row.attacking_type}
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px]"
                    />
                    <span>{formatTypeName(row.attacking_type)}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-rose-700">{row.weak}</td>
                <td className="px-2 py-2 text-emerald-700">{row.resist}</td>
                <td className="px-2 py-2 text-blue-700">{row.immune}</td>
                <td className="px-2 py-2 text-slate-700">{row.neutral}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
