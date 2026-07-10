// src/pages/shared/Leaderboard.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Empty, Spinner, useClassGroups, ClassTabs, usePagination, Pagination } from "../../components/ui";

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState("all");
  const ranks = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    api.get("/scores/leaderboard")
      .then(({ data }) => setStudents(data))
      .finally(() => setLoading(false));
  }, []);

  const { groups, classNames } = useClassGroups(students);
  const visibleStudents = activeClass === "all" ? students : (groups[activeClass] || []);
  const pagination = usePagination(visibleStudents.length, activeClass);
  const pagedStudents = visibleStudents.slice(pagination.start, pagination.start + pagination.pageSize);

  return (
    <div>
      <h1 className="font-serif font-black text-2xl text-green-900 mb-4">🏆 อันดับคะแนนสะสม</h1>

      {!loading && students.length > 0 && (
        <ClassTabs classNames={classNames} groups={groups} active={activeClass} onChange={setActiveClass} total={students.length} />
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800 font-bold">
              <tr>{["อันดับ", "ชื่อ", "ชั้น", "Level", "คะแนน"].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><div className="flex justify-center py-8"><Spinner /></div></td></tr>
              ) : !visibleStudents.length ? (
                <tr><td colSpan={5}><Empty icon="🏆" text="ยังไม่มีข้อมูล" /></td></tr>
              ) : pagedStudents.map((s, i) => {
                const rank = pagination.start + i;
                return (
                <tr key={s.id} className={`border-t border-green-50 ${rank < 3 ? "bg-yellow-50/50" : "hover:bg-green-50/50"}`}>
                  <td className="px-4 py-3 font-serif font-black text-xl">{rank < 3 ? ranks[rank] : `#${rank + 1}`}</td>
                  <td className="px-4 py-3 font-semibold">{s.name}</td>
                  <td className="px-4 py-3 text-green-500">{s.class}</td>
                  <td className="px-4 py-3"><span className="badge-green">Lv.{s.level}</span></td>
                  <td className="px-4 py-3 font-serif font-black text-xl text-green-700">{s.score.toLocaleString()}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && !!visibleStudents.length && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            total={visibleStudents.length}
          />
        )}
      </div>
    </div>
  );
}
