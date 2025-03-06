"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface ChartData {
  name: string
  value: number
}

interface DashboardChartProps {
  data: ChartData[]
  type: "line" | "bar" | "pie"
}

export function DashboardChart({ data, type }: DashboardChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Clear previous chart
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    const isDark = theme === "dark"
    const textColor = isDark ? "#e5e7eb" : "#374151"
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    const primaryColor = isDark ? "#8b5cf6" : "#6d28d9"
    const secondaryColor = isDark ? "#7c3aed" : "#7c3aed"

    // Set canvas dimensions
    const width = chartRef.current.width
    const height = chartRef.current.height
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Draw chart based on type
    if (type === "line") {
      drawLineChart(ctx, data, width, height, padding, chartWidth, chartHeight, primaryColor, gridColor, textColor)
    } else if (type === "bar") {
      drawBarChart(ctx, data, width, height, padding, chartWidth, chartHeight, primaryColor, gridColor, textColor)
    } else if (type === "pie") {
      drawPieChart(ctx, data, width, height, [primaryColor, "#f59e0b", "#10b981", "#3b82f6", "#ec4899"])
    }
  }, [data, type, theme])

  function drawLineChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData[],
    width: number,
    height: number,
    padding: number,
    chartWidth: number,
    chartHeight: number,
    primaryColor: string,
    gridColor: string,
    textColor: string,
  ) {
    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = gridColor
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw grid lines
    const maxValue = Math.max(...data.map((d) => d.value))
    const gridLines = 5
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = textColor
    ctx.font = "10px sans-serif"

    for (let i = 0; i <= gridLines; i++) {
      const y = height - padding - (i / gridLines) * chartHeight
      ctx.beginPath()
      ctx.strokeStyle = gridColor
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
      ctx.fillText(((maxValue * i) / gridLines).toFixed(0), padding - 5, y)
    }

    // Draw x-axis labels
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    const barWidth = chartWidth / data.length
    data.forEach((d, i) => {
      const x = padding + i * barWidth + barWidth / 2
      ctx.fillText(d.name, x, height - padding + 5)
    })

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = primaryColor
    ctx.lineWidth = 2
    data.forEach((d, i) => {
      const x = padding + i * barWidth + barWidth / 2
      const y = height - padding - (d.value / maxValue) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw points
    data.forEach((d, i) => {
      const x = padding + i * barWidth + barWidth / 2
      const y = height - padding - (d.value / maxValue) * chartHeight
      ctx.beginPath()
      ctx.fillStyle = primaryColor
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  function drawBarChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData[],
    width: number,
    height: number,
    padding: number,
    chartWidth: number,
    chartHeight: number,
    primaryColor: string,
    gridColor: string,
    textColor: string,
  ) {
    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = gridColor
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw grid lines
    const maxValue = Math.max(...data.map((d) => d.value))
    const gridLines = 5
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = textColor
    ctx.font = "10px sans-serif"

    for (let i = 0; i <= gridLines; i++) {
      const y = height - padding - (i / gridLines) * chartHeight
      ctx.beginPath()
      ctx.strokeStyle = gridColor
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
      ctx.fillText(((maxValue * i) / gridLines).toFixed(0), padding - 5, y)
    }

    // Draw bars
    const barWidth = (chartWidth / data.length) * 0.8
    const barSpacing = (chartWidth / data.length) * 0.2
    data.forEach((d, i) => {
      const x = padding + i * (barWidth + barSpacing) + barSpacing / 2
      const barHeight = (d.value / maxValue) * chartHeight
      const y = height - padding - barHeight

      ctx.fillStyle = primaryColor
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw x-axis labels
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillStyle = textColor
      ctx.fillText(d.name, x + barWidth / 2, height - padding + 5)
    })
  }

  function drawPieChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData[],
    width: number,
    height: number,
    colors: string[],
  ) {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    const radius = Math.min(width, height) / 2 - 40
    const centerX = width / 2
    const centerY = height / 2

    let startAngle = 0
    data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * 2 * Math.PI

      // Draw slice
      ctx.beginPath()
      ctx.fillStyle = colors[i % colors.length]
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(d.name, labelX, labelY)

      startAngle += sliceAngle
    })
  }

  return <canvas ref={chartRef} width={500} height={300} className="w-full h-full" />
}

