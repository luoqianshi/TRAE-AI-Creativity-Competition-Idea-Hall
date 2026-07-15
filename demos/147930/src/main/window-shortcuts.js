export function shouldPreventWindowCloseShortcut(input = {}) {
  return Boolean(
    input.type === 'keyDown' &&
      String(input.key || '').toLowerCase() === 'w' &&
      (input.control || input.meta) &&
      !input.alt &&
      !input.shift
  )
}

export function protectWindowCloseShortcut(window) {
  window.webContents.on('before-input-event', (event, input) => {
    if (shouldPreventWindowCloseShortcut(input)) {
      event.preventDefault()
    }
  })
}
