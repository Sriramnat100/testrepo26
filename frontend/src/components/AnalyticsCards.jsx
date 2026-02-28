import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangle, TrendingUp, PieChartIcon } from "lucide-react";

const COLORS = ["#10B981", "#EF4444", "#F59E0B"];

export const AnalyticsCards = ({ analytics }) => {
  if (!analytics) return null;

  const pieData = [
    { name: "PASS", value: analytics.pass_fail_monitor?.pass || 0 },
    { name: "FAIL", value: analytics.pass_fail_monitor?.fail || 0 },
    { name: "MONITOR", value: analytics.pass_fail_monitor?.monitor || 0 },
  ];

  return (
    <div className="flex flex-col gap-4" data-testid="analytics-cards">
      {/* Most Failed Parts */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Most Failed Parts/Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-40 w-full min-w-0">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart
                data={analytics.failed_parts}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={80}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value, name, props) => [
                    `${value} failures (${props.payload.percentage}%)`,
                    "Count",
                  ]}
                />
                <Bar
                  dataKey="count"
                  fill="#EF4444"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Inspections Over Time */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Inspections Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.inspections_over_time}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#F9A825"
                  strokeWidth={2}
                  dot={{ fill: "#F9A825", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pass vs Fail vs Monitor */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-purple-500" />
            PASS vs FAIL vs MONITOR
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="h-28 w-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-xs text-gray-600">
                    {item.name}: <span className="font-semibold">{item.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCards;
