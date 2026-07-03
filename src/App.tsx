// src/App.tsx
export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif' }}>
      <div style={{ width: 240, background: '#f9fafb', borderRight: '1px solid #e5e7eb', padding: 12 }}>
        左侧面板（待实现）
      </div>
      <div style={{ flex: 1, background: '#f3f4f6' }}>
        画布（待实现）
      </div>
      <div style={{ width: 280, background: '#f9fafb', borderLeft: '1px solid #e5e7eb', padding: 12 }}>
        右侧面板（待实现）
      </div>
    </div>
  )
}
