import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Rect, Text as SvgText, Line, Circle, Polyline, G, Path } from "react-native-svg";
import { colors, spacing, radius } from "../constants/theme";
import { api } from "../services/api";

const PALETTE = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(Math.round(n));
}

// ── Grouped Bar Chart ──────────────────────────────────────────────────────
function BarChart({ data, keys, barColors, width }: {
  data: any[]; keys: string[]; barColors: string[]; width: number;
}) {
  if (!data.length) return null;
  const H = 190;
  const PAD = { top: 16, bottom: 36, left: 52, right: 8 };
  const chartW = width - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => Number(d[k]) || 0)), 1);
  const groupW = chartW / data.length;
  const barW = Math.max(4, (groupW / keys.length) - 3);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <Svg width={width} height={H}>
      {yTicks.map((t, i) => {
        const y = PAD.top + chartH * (1 - t);
        return (
          <G key={i}>
            <Line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y} stroke={colors.border} strokeWidth={1} />
            <SvgText x={PAD.left - 4} y={y + 4} fontSize={9} fill={colors.textDim} textAnchor="end">
              {fmt(maxVal * t)}
            </SvgText>
          </G>
        );
      })}
      {data.map((d, gi) => {
        const gx = PAD.left + gi * groupW;
        return keys.map((k, ki) => {
          const val = Number(d[k]) || 0;
          const bh = Math.max((val / maxVal) * chartH, 1);
          const x = gx + ki * (barW + 2) + (groupW - keys.length * (barW + 2)) / 2;
          const y = PAD.top + chartH - bh;
          return <Rect key={`${gi}-${ki}`} x={x} y={y} width={barW} height={bh} fill={barColors[ki]} rx={2} />;
        });
      })}
      {data.map((d, i) => (
        <SvgText key={i}
          x={PAD.left + i * groupW + groupW / 2}
          y={H - 6}
          fontSize={9} fill={colors.textDim} textAnchor="middle">
          {String(d.month || d.name || "").slice(0, 6)}
        </SvgText>
      ))}
    </Svg>
  );
}

// ── Line Chart ─────────────────────────────────────────────────────────────
function LineChart({ data, dataKey, color, width }: {
  data: any[]; dataKey: string; color: string; width: number;
}) {
  if (data.length < 2) return null;
  const H = 160;
  const PAD = { top: 16, bottom: 32, left: 52, right: 8 };
  const chartW = width - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const vals = data.map(d => Number(d[dataKey]) || 0);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals, minVal + 1);
  const range = maxVal - minVal;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * chartW,
    y: PAD.top + chartH - ((Number(d[dataKey]) - minVal) / range) * chartH,
  }));
  const polyPoints = pts.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <Svg width={width} height={H}>
      {[0, 0.5, 1].map((t, i) => {
        const val = minVal + range * t;
        const y = PAD.top + chartH * (1 - t);
        return (
          <G key={i}>
            <Line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y} stroke={colors.border} strokeWidth={1} />
            <SvgText x={PAD.left - 4} y={y + 4} fontSize={9} fill={colors.textDim} textAnchor="end">{fmt(val)}</SvgText>
          </G>
        );
      })}
      <Polyline points={polyPoints} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      {pts.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />)}
      {data.map((d, i) => (
        <SvgText key={i} x={pts[i].x} y={H - 4} fontSize={9} fill={colors.textDim} textAnchor="middle">
          {String(d.month || "").slice(0, 6)}
        </SvgText>
      ))}
    </Svg>
  );
}

// ── Donut Chart ────────────────────────────────────────────────────────────
function DonutChart({ data, width }: { data: { name: string; value: number }[]; width: number }) {
  if (!data.length) return null;
  const size = Math.min(width * 0.7, 180);
  const cx = size / 2; const cy = size / 2;
  const R = size * 0.38; const r = size * 0.22;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle); const y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle); const y2 = cy + R * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const ix1 = cx + r * Math.cos(angle - sweep); const iy1 = cy + r * Math.sin(angle - sweep);
    const ix2 = cx + r * Math.cos(angle); const iy2 = cy + r * Math.sin(angle);
    const path = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;
    return { path, color: PALETTE[i % PALETTE.length], name: d.name, value: d.value, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {slices.map((s, i) => <Path key={i} d={s.path} fill={s.color} />)}
        <SvgText x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight="bold" fill={colors.text}>{total}</SvgText>
        <SvgText x={cx} y={cy + 18} textAnchor="middle" fontSize={9} fill={colors.textDim}>total</SvgText>
      </Svg>
      <View style={styles.legend}>
        {slices.map((s, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.name} ({s.pct}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────
export function ReportsScreen() {
  const { width } = useWindowDimensions();
  const chartWidth = width - spacing.lg * 2 - 16;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/reports/stats/");
      setStats(res.data);
    } catch { setStats(null); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.loadingText}>Loading analytics...</Text>
    </View>
  );

  const totals = stats?.totals || {};
  const revenueVsExpenses: any[] = stats?.revenue_vs_expenses || [];
  const projectChart: any[] = stats?.project_status_chart || [];
  const expenseChart: any[] = stats?.expense_by_category || [];
  const profitTrend = revenueVsExpenses.map((d: any) => ({
    month: d.month,
    profit: (Number(d.revenue) || 0) - (Number(d.expenses) || 0),
  }));

  const kpis = [
    { label: "Revenue",    value: `UGX ${fmt(totals.revenue || 0)}`,  icon: "trending-up-outline",   color: "#10b981" },
    { label: "Expenses",   value: `UGX ${fmt(totals.expenses || 0)}`, icon: "trending-down-outline",  color: "#ef4444" },
    { label: "Net Profit", value: `UGX ${fmt(totals.profit || 0)}`,   icon: "cash-outline",           color: (totals.profit || 0) >= 0 ? "#3b82f6" : "#ef4444" },
    { label: "Customers",  value: String(totals.customers || 0),       icon: "people-outline",         color: "#8b5cf6" },
    { label: "Projects",   value: String(totals.projects || 0),        icon: "map-outline",            color: "#f59e0b" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}>

      <Text style={styles.heading}>Reports & Analytics</Text>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        {kpis.map(k => (
          <View key={k.label} style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: k.color + "20" }]}>
              <Ionicons name={k.icon as any} size={18} color={k.color} />
            </View>
            <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* Revenue vs Expenses */}
      {revenueVsExpenses.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue vs Expenses (Monthly)</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#10b981" }]} /><Text style={styles.legendText}>Revenue</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} /><Text style={styles.legendText}>Expenses</Text></View>
          </View>
          <BarChart data={revenueVsExpenses} keys={["revenue", "expenses"]} barColors={["#10b981", "#ef4444"]} width={chartWidth} />
        </View>
      )}

      {/* Profit Trend */}
      {profitTrend.length >= 2 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Profit Trend</Text>
          <LineChart data={profitTrend} dataKey="profit" color="#3b82f6" width={chartWidth} />
        </View>
      )}

      {/* Project Status Donut */}
      {projectChart.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Project Status Breakdown</Text>
          <DonutChart data={projectChart} width={chartWidth} />
        </View>
      )}

      {/* Expense by Category Donut */}
      {expenseChart.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Expenses by Category</Text>
          <DonutChart data={expenseChart} width={chartWidth} />
        </View>
      )}

      {!stats && (
        <View style={styles.emptyWrap}>
          <Ionicons name="bar-chart-outline" size={52} color={colors.textDim} />
          <Text style={styles.empty}>No data available yet</Text>
          <Text style={styles.emptySub}>Add transactions, expenses and projects to see analytics</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48 },
  loadingWrap: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: colors.textMuted, fontSize: 14 },
  heading: { fontSize: 22, fontWeight: "900", color: colors.text, marginBottom: spacing.lg },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: spacing.lg },
  kpiCard: { flex: 1, minWidth: "28%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  kpiIcon: { width: 34, height: 34, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  kpiValue: { fontSize: 15, fontWeight: "900", marginBottom: 2 },
  kpiLabel: { fontSize: 10, color: colors.textMuted },
  chartCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, overflow: "hidden" },
  chartTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  chartLegend: { flexDirection: "row", gap: 16, marginBottom: 8 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.textMuted },
  emptyWrap: { alignItems: "center", marginTop: 60, gap: 10 },
  empty: { fontSize: 15, color: colors.textDim, fontWeight: "600" },
  emptySub: { fontSize: 12, color: colors.textDim, textAlign: "center" },
});
