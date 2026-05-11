"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "../../lib/utils"

const {
  ResponsiveContainer,
  Area,
  Bar,
  CartesianAxis,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  Pie,
  PieChart,
} = RechartsPrimitive

export const Chart = ResponsiveContainer
export const ChartArea = Area
export const ChartBar = Bar
export const ChartCartesianAxis = CartesianAxis
export const ChartCartesianGrid = CartesianGrid
export const ChartComposedChart = ComposedChart
export const ChartLine = Line
export const ChartXAxis = XAxis
export const ChartYAxis = YAxis
export const ChartLegend = Legend
export const ChartTooltip = Tooltip
export const ChartPie = Pie
export const ChartPieChart = PieChart

type ChartLegendContentProps = {
  active?: boolean
  payload?: Array<{
    value: any
    type: any
    id: string
    color: string
    payload: {
      stroke: string
      fill: string
      name: string
      value: number
    }
  }>
}

export function ChartLegendContent({ active, payload }: ChartLegendContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="grid gap-2">
      {payload.map((item, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-muted-foreground">
            {item.payload.name}: {item.payload.value}
          </span>
        </div>
      ))}
    </div>
  )
}

ChartLegendContent.displayName = "ChartLegendContent"

export function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="grid gap-2">
        {payload.map((item: any, index: number) => (
          <div key={item.name ?? index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
      {label && (
        <div className="mt-2 border-t pt-2">
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      )}
    </div>
  )
}

ChartTooltipContent.displayName = "ChartTooltipContent"


