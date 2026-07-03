export type PortType = 'MODEL' | 'CLIP' | 'VAE' | 'CONDITIONING' | 'LATENT' | 'IMAGE'

export const PORT_COLORS: Record<PortType, string> = {
  MODEL:        '#a855f7',
  CLIP:         '#22c55e',
  VAE:          '#ef4444',
  CONDITIONING: '#eab308',
  LATENT:       '#6b7280',
  IMAGE:        '#f97316',
}

export const PORT_TYPES = Object.keys(PORT_COLORS) as PortType[]
