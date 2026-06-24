import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface HomePageProps {
  onBackToTemplate?: () => void
}

export default function HomePage({ onBackToTemplate: _onBackToTemplate }: HomePageProps) {
  const [text, setText] = useState('')
  const [qrValue, setQrValue] = useState('')
  const [enableCompression, setEnableCompression] = useState(false)
  const qrContainerRef = useRef<HTMLDivElement>(null)

  const handleGenerateQR = () => {
    if (text.trim()) {
      let finalValue = text.trim()
      if (enableCompression) {
        const compressed = finalValue.replace(/\s+/g, ' ').trim()
        finalValue = compressed
      }
      setQrValue(finalValue)
    }
  }

  const handleClearQR = () => {
    setQrValue('')
    setText('')
  }

  const handleCopyImage = async () => {
    if (!qrContainerRef.current) return
    const svg = qrContainerRef.current.querySelector('svg')
    if (!svg) return

    try {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob
                })
              ])
              alert('二维码图像已复制到剪贴板！')
            } catch {
              alert('无法复制图像，请尝试下载')
            }
          }
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
      img.src = url
    } catch {
      alert('复制图像时出错')
    }
  }

  const handleDownload = () => {
    if (!qrContainerRef.current) return
    const svg = qrContainerRef.current.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = pngUrl
      link.click()
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div className="home-page">
      <h1 className="page-title">图片编辑器 - 二维码生成器</h1>

      <div className="qr-generator">
        <div className="input-section">
          <label htmlFor="qr-input" className="input-label">
            输入文本或网址：
          </label>
          <textarea
            id="qr-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="请在此输入内容..."
            rows={4}
            className="text-input"
          />

          <div className="options-row">
            <label className="compression-label">
              <input
                type="checkbox"
                checked={enableCompression}
                onChange={(e) => setEnableCompression(e.target.checked)}
              />
              <span>开启文本压缩</span>
            </label>
          </div>

          <div className="button-group">
            <button
              onClick={handleGenerateQR}
              disabled={!text.trim()}
              className="generate-btn"
            >
              生成二维码
            </button>
            <button
              onClick={handleClearQR}
              disabled={!qrValue}
              className="clear-btn"
            >
              清空
            </button>
          </div>
        </div>

        {(qrValue || !text) && (
          <div className="output-section">
            {qrValue ? (
              <>
                <h3 className="output-title">生成的二维码：</h3>
                <div className="qr-code-container" ref={qrContainerRef}>
                  <QRCodeSVG
                    value={qrValue}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <div className="action-buttons">
                  <button onClick={handleCopyImage} className="action-btn copy-btn">
                    复制二维码
                  </button>
                  <button onClick={handleDownload} className="action-btn download-btn">
                    下载二维码
                  </button>
                </div>
                <p className="qr-text">内容：{qrValue}</p>
              </>
            ) : (
              <div className="placeholder">
                <p>请在上方输入内容并点击「生成二维码」查看结果</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .home-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: var(--sans);
        }

        .page-title {
          color: var(--text-h);
          margin-bottom: 2rem;
          text-align: center;
          margin-top: 0;
        }

        .qr-generator {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .input-section {
          background: var(--bg);
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }

        .input-label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-h);
          font-weight: 500;
        }

        .text-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--code-bg);
          color: var(--text);
          font-family: var(--mono);
          resize: vertical;
          min-height: 100px;
          box-sizing: border-box;
        }

        .text-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-bg);
        }

        .options-row {
          margin: 1rem 0;
        }

        .compression-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text);
          cursor: pointer;
          font-size: 14px;
        }

        .compression-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        button {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .generate-btn {
          background: var(--accent);
          color: white;
          font-weight: 500;
        }

        .generate-btn:hover:not(:disabled) {
          background: var(--accent-border);
          transform: translateY(-1px);
        }

        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-btn {
          background: var(--border);
          color: var(--text);
        }

        .clear-btn:hover:not(:disabled) {
          background: var(--text);
          color: var(--bg);
        }

        .clear-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .output-section {
          background: var(--bg);
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }

        .output-title {
          color: var(--text-h);
          margin-top: 0;
          margin-bottom: 1rem;
          text-align: center;
        }

        .qr-code-container {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
          padding: 1rem;
          background: var(--code-bg);
          border-radius: 6px;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 1rem 0;
        }

        .action-btn {
          padding: 0.6rem 1.2rem;
          font-size: 14px;
          font-weight: 500;
        }

        .copy-btn {
          background: #2563eb;
          color: white;
        }

        .copy-btn:hover {
          background: #1d4ed8;
        }

        .download-btn {
          background: #10b981;
          color: white;
        }

        .download-btn:hover {
          background: #059669;
        }

        .qr-text {
          color: var(--text);
          font-size: 14px;
          word-break: break-all;
          margin: 0.5rem 0 0 0;
          padding: 0.5rem;
          background: var(--code-bg);
          border-radius: 4px;
        }

        .placeholder {
          text-align: center;
          color: var(--text);
          font-style: italic;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .home-page {
            padding: 1rem;
          }

          .qr-generator {
            gap: 1rem;
          }

          .button-group,
          .action-buttons {
            flex-direction: column;
          }

          button,
          .action-btn {
            width: 100%;
          }

          .qr-code-container {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}
