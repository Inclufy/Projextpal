// Yanmar ATR-01 — task sub-totals per Category (COUNTIFS equivalent).
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface Props {
  projectId: number | string;
  className?: string;
}

export function TaskCategorySubtotals({ projectId, className }: Props) {
  const { pt } = usePageTranslations();
  const [rows, setRows] = useState<any[]>([]);
  const [grand, setGrand] = useState<{ total: number; completed: number }>({ total: 0, completed: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch(`/api/v1/projects/tasks/category-subtotals/?project=${projectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setRows(d.categories || []);
          setGrand({ total: d.grand_total || 0, completed: d.grand_completed || 0 });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [projectId]);

  if (!loaded || rows.length === 0) return null;

  return (
    <Card className={`p-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{pt("Tasks by Category")}</h3>
        <Badge variant="outline">{grand.completed}/{grand.total} {pt("done")}</Badge>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b">
            <th className="py-1">{pt("Category")}</th>
            <th className="py-1 px-2 text-right">{pt("Total")}</th>
            <th className="py-1 px-2 text-right">{pt("Done")}</th>
            <th className="py-1 px-2 text-right">{pt("In progress")}</th>
            <th className="py-1 px-2 text-right">{pt("Pending")}</th>
            <th className="py-1 px-2 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-1 font-medium">{r.category}</td>
              <td className="py-1 px-2 text-right">{r.total}</td>
              <td className="py-1 px-2 text-right text-green-600">{r.completed}</td>
              <td className="py-1 px-2 text-right text-blue-600">{r.in_progress}</td>
              <td className="py-1 px-2 text-right text-muted-foreground">{r.pending}</td>
              <td className="py-1 px-2 text-right font-medium">{r.progress_pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default TaskCategorySubtotals;
