import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type TimerMode = 'focus' | 'break'

export const useStudyStore = defineStore('study', () => {
  const isRunning = ref(false)
  const isBreak = ref(false)
  const currentMode = ref<TimerMode>('focus')
  const focusMinutes = ref(25)
  const breakMinutes = ref(5)
  const remainingTime = ref(25 * 60)
  const currentTaskId = ref<number | null>(null)
  const onFocusComplete = ref<((minutes: number) => void) | null>(null)

  let timerInterval: ReturnType<typeof setInterval> | null = null
  let lastActivity = Date.now()
  let idleNotified = false

  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingTime.value / 60)
    const seconds = remainingTime.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const totalFocusSeconds = computed(() => focusMinutes.value * 60)
  const totalBreakSeconds = computed(() => breakMinutes.value * 60)

  function recordActivity() {
    lastActivity = Date.now()
    idleNotified = false
  }

  function setFocusCompleteCallback(cb: (minutes: number) => void) {
    onFocusComplete.value = cb
  }

  function setMicroMode(minutes: 5 | 25) {
    focusMinutes.value = minutes
    if (!isRunning.value && !isBreak.value) {
      remainingTime.value = minutes * 60
    }
  }

  function startTimer() {
    if (isRunning.value) return
    recordActivity()
    isRunning.value = true
    timerInterval = setInterval(() => {
      if (Date.now() - lastActivity > 5 * 60 * 1000 && !idleNotified && !isBreak.value) {
        idleNotified = true
      }
      if (remainingTime.value > 0) {
        remainingTime.value--
      } else {
        completeSession()
      }
    }, 1000)
  }

  function pauseTimer() {
    isRunning.value = false
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function resetTimer() {
    pauseTimer()
    isBreak.value = false
    currentMode.value = 'focus'
    remainingTime.value = focusMinutes.value * 60
    idleNotified = false
  }

  function startBreak() {
    pauseTimer()
    isBreak.value = true
    currentMode.value = 'break'
    remainingTime.value = breakMinutes.value * 60
    startTimer()
  }

  function completeSession() {
    pauseTimer()

    if (!isBreak.value) {
      const minutes = focusMinutes.value
      onFocusComplete.value?.(minutes)
      isBreak.value = true
      currentMode.value = 'break'
      remainingTime.value = breakMinutes.value * 60
      startTimer()
    } else {
      isBreak.value = false
      currentMode.value = 'focus'
      remainingTime.value = focusMinutes.value * 60
    }
  }

  function setCurrentTask(taskId: number | null) {
    currentTaskId.value = taskId
  }

  const isIdle = computed(() => idleNotified)

  return {
    isRunning,
    isBreak,
    currentMode,
    remainingTime,
    currentTaskId,
    focusMinutes,
    breakMinutes,
    formattedTime,
    totalFocusSeconds,
    totalBreakSeconds,
    isIdle,
    startTimer,
    pauseTimer,
    resetTimer,
    startBreak,
    completeSession,
    setCurrentTask,
    setMicroMode,
    setFocusCompleteCallback,
    recordActivity,
  }
})
