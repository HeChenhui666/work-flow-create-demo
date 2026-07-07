interface KSamplerConfig {
  steps: number
  cfg: number
}

export function validateKSamplerConfig(config: KSamplerConfig): string[] {
  const warnings: string[] = []
  if (config.steps < 5) warnings.push('步数过少（< 5），生成质量可能较差')
  if (config.steps > 100) warnings.push('步数过多（> 100），生成速度会很慢')
  if (config.cfg > 15) warnings.push('CFG Scale 过高（> 15），可能导致过饱和')
  if (config.cfg < 1) warnings.push('CFG Scale 过低（< 1），提示词影响很弱')
  return warnings
}
