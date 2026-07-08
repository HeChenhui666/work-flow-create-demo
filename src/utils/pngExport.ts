import { toPng } from 'html-to-image'

export async function exportCanvasToPng(
  element: HTMLElement,
  fileName = 'workflow.png',
): Promise<boolean> {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#f9fafb',
      pixelRatio: 2,
      cacheBust: true,
    })

    const link = document.createElement('a')
    link.download = fileName
    link.href = dataUrl
    link.click()
    return true
  } catch (error) {
    console.error('PNG export failed:', error)
    alert('导出 PNG 失败，请重试')
    return false
  }
}
