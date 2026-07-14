<template>
  <div class="line-chart">
    <canvas ref="canvasRef" class="chart-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  data: number[]
  labels: string[]
  color?: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

function drawChart() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = rect.height
  const padding = 20

  ctx.clearRect(0, 0, width, height)

  if (props.data.length === 0) return

  const maxValue = Math.max(...props.data) * 1.2
  const minValue = Math.min(...props.data) * 0.8
  const valueRange = maxValue - minValue || 1

  const xStep = (width - padding * 2) / (props.data.length - 1 || 1)

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height - padding * 2) * (i / 4)
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
  const chartColor = props.color || '#0ea5e9'
  gradient.addColorStop(0, chartColor + '40')
  gradient.addColorStop(1, chartColor + '00')

  ctx.beginPath()
  props.data.forEach((value, index) => {
    const x = padding + index * xStep
    const y = height - padding - ((value - minValue) / valueRange) * (height - padding * 2)
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.lineTo(padding + (props.data.length - 1) * xStep, height - padding)
  ctx.lineTo(padding, height - padding)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.beginPath()
  props.data.forEach((value, index) => {
    const x = padding + index * xStep
    const y = height - padding - ((value - minValue) / valueRange) * (height - padding * 2)
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.strokeStyle = chartColor
  ctx.lineWidth = 2
  ctx.stroke()

  props.data.forEach((value, index) => {
    const x = padding + index * xStep
    const y = height - padding - ((value - minValue) / valueRange) * (height - padding * 2)
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = chartColor
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
  })

  ctx.fillStyle = '#6b7280'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  props.labels.forEach((label, index) => {
    const x = padding + index * xStep
    ctx.fillText(label, x, height - 5)
  })
}

onMounted(() => {
  drawChart()
  window.addEventListener('resize', drawChart)
})

watch(() => [props.data, props.labels], () => {
  drawChart()
}, { deep: true })
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 180px;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}
</style>
