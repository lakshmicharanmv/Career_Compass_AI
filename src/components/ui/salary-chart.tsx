
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { role: "Data Sci.", salary: 140000, fill: "var(--color-data-scientist)" },
  { role: "DevOps Eng.", salary: 135000, fill: "var(--color-devops-engineer)" },
  { role: "Software Eng.", salary: 120000, fill: "var(--color-software-engineer)" },
  { role: "UX Designer", salary: 95000, fill: "var(--color-ux-designer)" },
  { role: "QA Tester", salary: 85000, fill: "var(--color-qa-tester)" },
]

const chartConfig = {
  salary: {
    label: "Salary",
  },
  "data-scientist": {
    label: "Data Scientist",
    color: "hsl(var(--chart-1))",
  },
  "devops-engineer": {
    label: "DevOps Engineer",
    color: "hsl(var(--chart-2))",
  },
  "software-engineer": {
    label: "Software Engineer",
    color: "hsl(var(--chart-3))",
  },
  "ux-designer": {
    label: "UX Designer",
    color: "hsl(var(--chart-4))",
  },
  "qa-tester": {
    label: "QA Tester",
    color: "hsl(var(--chart-5))",
  },
} 
export default function SalaryChart() {
  return (
      <ChartContainer config={chartConfig} className="h-[240px]">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="role"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="salary" strokeWidth={2} radius={8} />
        </BarChart>
      </ChartContainer>
  )
}
