import { toPng } from 'html-to-image'
import { getNodesBounds, type Node, type ReactFlowInstance } from '@xyflow/react'

/**
 * 导出 PNG 时临时清理渲染伪影：
 * - 计算所有节点包围盒，调整 viewport 使全部节点可见
 * - 禁用边的 opacity/filter/animation（避免叠加混合伪影）
 * - 添加 shape-rendering: geometricPrecision（减少抗锯齿）
 * - 移除 box-shadow 和执行高亮动画
 */
const EXPORT_STYLE_ID = '__export-clean-style__'

function injectExportStyle(): HTMLStyleElement {
  const style = document.createElement('style')
  style.id = EXPORT_STYLE_ID
  style.textContent = `
    /* 边路径：强制不透明、无滤镜、精确渲染 */
    .react-flow__edge-path {
      stroke-opacity: 1 !important;
      filter: none !important;
      animation: none !important;
      shape-rendering: geometricPrecision !important;
      marker-end: none !important;
    }
    /* 隐藏 SVG marker 定义容器 */
    .react-flow__edge svg[style*="width: 0"],
    .react-flow__edge svg[style*="width:0"] {
      display: none !important;
    }
    /* 节点和边：移除所有阴影和滤镜 */
    .react-flow__node *,
    .react-flow__edge *,
    .react-flow__node,
    .react-flow__edge {
      box-shadow: none !important;
      filter: none !important;
    }
    /* 禁用执行高亮脉冲动画 */
    .react-flow__node.executing {
      animation: none !important;
    }
    /* 隐藏 UI 控件（Controls、MiniMap 等） */
    .react-flow__controls,
    .react-flow__minimap,
    .react-flow__attribution {
      display: none !important;
    }
  `
  document.head.appendChild(style)
  return style
}

function removeExportStyle(): void {
  const style = document.getElementById(EXPORT_STYLE_ID)
  if (style) {
    style.remove()
  }
}

export interface ExportOptions {
  fileName?: string
  backgroundColor?: string
  pixelRatio?: number
  padding?: number
}

export async function exportCanvasToPng(
  element: HTMLElement,
  reactFlowInstance: ReactFlowInstance | null,
  nodes: Node[],
  options: ExportOptions = {},
): Promise<boolean> {
  const {
    fileName = 'workflow.png',
    backgroundColor = '#ffffff',
    pixelRatio = 2,
    padding = 40,
  } = options

  let originalViewport: { x: number; y: number; zoom: number } | null = null

  try {
    if (reactFlowInstance && nodes.length > 0) {
      // 1. 保存原始 viewport
      originalViewport = reactFlowInstance.getViewport()

      // 2. 计算所有节点的包围盒
      const bounds = getNodesBounds(nodes)

      // 3. 获取画布容器尺寸
      const containerWidth = element.clientWidth
      const containerHeight = element.clientHeight

      // 4. 计算适配所有节点的 zoom 和偏移
      const contentWidth = bounds.width + padding * 2
      const contentHeight = bounds.height + padding * 2
      const zoom = Math.min(
        containerWidth / contentWidth,
        containerHeight / contentHeight,
        1, // 不超过 1x
      )

      const viewportX = -(bounds.x - padding) * zoom + (containerWidth - contentWidth * zoom) / 2
      const viewportY = -(bounds.y - padding) * zoom + (containerHeight - contentHeight * zoom) / 2

      reactFlowInstance.setViewport({ x: viewportX, y: viewportY, zoom })
    }

    // 5. 注入清理样式
    injectExportStyle()

    // 6. 等待样式生效 + viewport 更新完成（双层 RAF）
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    // 7. 导出
    const dataUrl = await toPng(element, {
      backgroundColor,
      pixelRatio,
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
  } finally {
    // 8. 恢复原始 viewport
    if (reactFlowInstance && originalViewport) {
      reactFlowInstance.setViewport(originalViewport)
    }

    // 9. 移除临时样式
    removeExportStyle()
  }
}
