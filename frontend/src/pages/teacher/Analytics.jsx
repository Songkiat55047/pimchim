import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";
import useT from "../../i18n/useT";

const COLORS = ["#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa", "#34d399", "#facc15"];

function Card({ title, children }) {
  return (
    <div className="card">
      <h3 className="font-serif font-bold text-green-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [students, setStudents] = useState([]);
  const [scoreLogs, setScoreLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useT("analytics");

  useEffect(() => {
    Promise.all([
      api.get("/students"),
      api.get("/scores/leaderboard"),
    ]).then(([s, lb]) => {
      setStudents(s.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-green-400 text-center py-20">{t("loading")}</div>;
  if (!students.length) return <div className="text-green-400 text-center py-20">{t("noStudents")}</div>;

  // ── Score Distribution ──
  const ranges = [
    { range: "0–100", min: 0, max: 100 },
    { range: "101–300", min: 101, max: 300 },
    { range: "301–500", min: 301, max: 500 },
    { range: "501–700", min: 501, max: 700 },
    { range: "700+", min: 701, max: Infinity },
  ];
  const scoreDistData = ranges.map(r => ({
    range: r.range,
    count: students.filter(s => s.score >= r.min && s.score <= r.max).length,
  }));

  // ── Level Distribution ──
  const levelMap = {};
  students.forEach(s => {
    const lv = `Level ${s.level}`;
    levelMap[lv] = (levelMap[lv] || 0) + 1;
  });
  const levelData = Object.entries(levelMap)
    .sort((a, b) => parseInt(a[0].split(" ")[1]) - parseInt(b[0].split(" ")[1]))
    .map(([name, value]) => ({ name, value }));

  // ── Class Performance ──
  const classMap = {};
  students.forEach(s => {
    if (!classMap[s.class]) classMap[s.class] = { total: 0, count: 0 };
    classMap[s.class].total += s.score;
    classMap[s.class].count++;
  });
  const classData = Object.entries(classMap)
    .map(([cls, v]) => ({
      class: cls,
      avg: Math.round(v.total / v.count),
      count: v.count,
    }))
    .sort((a, b) => b.avg - a.avg);

  // ── Top 10 Students ──
  const top10 = students.slice(0, 10).map(s => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
    score: s.score,
  }));

  // ── Password Change Status ──
  const changed = students.filter(s => s.passwordChanged).length;
  const notChanged = students.length - changed;
  const pwData = [
    { name: t("pwChanged"), value: changed },
    { name: t("pwNotChanged"), value: notChanged },
  ];

  const avg = Math.round(students.reduce((a, s) => a + s.score, 0) / students.length);
  const maxScore = Math.max(...students.map(s => s.score));
  const minScore = Math.min(...students.map(s => s.score));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif font-bold text-2xl text-green-900 mb-1">{t("title")}</h1>
        <p className="text-green-500 text-sm">{t("subtitle")}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("avgScore"), value: avg.toLocaleString(), color: "text-blue-600" },
          { label: t("maxScore"), value: maxScore.toLocaleString(), color: "text-green-600" },
          { label: t("minScore"), value: minScore.toLocaleString(), color: "text-orange-500" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={`font-serif font-bold text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Score distribution + Level pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title={t("cardScoreDist")}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name={t("studentsSeries")} fill="#4ade80" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t("cardLevelPie")}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={levelData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {levelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 2: Class performance + Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title={t("cardClassAvg")}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="class" type="category" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Bar dataKey="avg" name={t("avgSeries")} fill="#60a5fa" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t("cardTop10")}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top10} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="score" name={t("scoreSeries")} fill="#a78bfa" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 3: Password change status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title={t("cardPwStatus")}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pwData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                <Cell fill="#4ade80" />
                <Cell fill="#fca5a5" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t("cardSummary")}>
          <div className="space-y-3 mt-2">
            {[
              { label: t("totalStudents"), value: students.length, color: "bg-green-100 text-green-700" },
              { label: t("totalClasses"), value: Object.keys(classMap).length, color: "bg-blue-100 text-blue-700" },
              { label: t("pwChangedRatio"), value: `${changed}/${students.length}`, color: "bg-purple-100 text-purple-700" },
              { label: t("level5Plus"), value: students.filter(s => s.level >= 5).length, color: "bg-yellow-100 text-yellow-700" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
