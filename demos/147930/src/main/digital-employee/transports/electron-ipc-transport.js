import { DigitalEmployeeManager } from '../digital-employee-manager.js'

export function registerDigitalEmployeeIpc({
  ipcMain,
  manager = null,
  agentRuntimeManager = null,
  prepareRequest = null
}) {
  const digitalEmployeeManager =
    manager || new DigitalEmployeeManager({ agentRuntimeManager })
  const webContentsById = new Map()
  const jobWebContents = new Map()

  digitalEmployeeManager.on('event', (event) => {
    const webContentsId = jobWebContents.get(event.jobId)
    const target = webContentsById.get(webContentsId)

    if (target && !target.isDestroyed()) {
      target.send('digital-employee:event', sanitizeForIpc(event))
    }
  })

  ipcMain.handle('digital-employee:start', async (event, payload) => {
    webContentsById.set(event.sender.id, event.sender)
    const request =
      typeof prepareRequest === 'function' ? await prepareRequest(payload || {}) : payload
    const job = digitalEmployeeManager.startJob(request, {
      webContentsId: event.sender.id
    })
    jobWebContents.set(job.id, event.sender.id)
    return sanitizeForIpc(job)
  })

  ipcMain.handle('digital-employee:stop', (_, jobId) => {
    return digitalEmployeeManager.stopJob(String(jobId || ''))
  })

  ipcMain.handle('digital-employee:pause', (_, jobId) => {
    return digitalEmployeeManager.pauseJob(String(jobId || ''))
  })

  ipcMain.handle('digital-employee:resume', (_, jobId) => {
    return digitalEmployeeManager.resumeJob(String(jobId || ''))
  })

  ipcMain.handle('digital-employee:respond-question', (_, payload = {}) => {
    return digitalEmployeeManager.respondToQuestion(
      String(payload.jobId || ''),
      String(payload.requestId || payload.questionId || ''),
      payload.response || {}
    )
  })

  ipcMain.handle('digital-employee:get-job', (_, jobId) => {
    return sanitizeForIpc(digitalEmployeeManager.getJob(String(jobId || '')))
  })

  return {
    manager: digitalEmployeeManager,
    stopJobsForWebContents(webContentsId) {
      for (const [jobId, targetWebContentsId] of jobWebContents.entries()) {
        if (targetWebContentsId === webContentsId) {
          digitalEmployeeManager.stopJob(jobId)
          jobWebContents.delete(jobId)
        }
      }

      webContentsById.delete(webContentsId)
    },
    stopAll() {
      digitalEmployeeManager.stopAll()
      webContentsById.clear()
      jobWebContents.clear()
    }
  }
}

function sanitizeForIpc(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return {
      id: '',
      jobId: '',
      type: 'digital.job.failed',
      timestamp: Date.now(),
      payload: {
        message: 'Failed to serialize digital employee payload for IPC.'
      }
    }
  }
}
