import { groundRoutes } from './scene-layout'

export const sceneAssets = [
  'sky',
  'skyline',
  'apron',
  'terminal',
  'seats-front',
  'seats-back',
  'foreground-seats',
  'backpack',
  'closed-macbook',
  'aircraft',
  'clouds',
  'provisioning',
  'baggage-train',
  'pushback',
] as const
export const optionalAssets = new Set<string>([
  'aircraft',
  'clouds',
  ...groundRoutes.map(({ name }) => name),
])
export const assetURL = (name: string) => `/scene/${name}.webp?rev=illustrated-3`
export const sprite = (name: string, className = name) =>
  `<img class="art ${className}" data-ambient="${name}" src="${assetURL(name)}" alt="" draggable="false" />`

const architecture = (className: string, box: string) =>
  `<svg class="art ${className}" viewBox="${box}" preserveAspectRatio="none"><image href="${assetURL('terminal')}" width="1536" height="1024" filter="url(#terminal-alpha)" /></svg>`
const skyline = (className: string) =>
  `<svg class="art ${className}" viewBox="0 0 1536 512"><image href="${assetURL('skyline')}" width="1536" height="512" filter="url(#${className === 'city-lights' ? 'skyline-lights' : 'skyline-alpha'})" /></svg>`

/** The flat magenta window key clears the full pane, including door-handle edges.
 *  Painted structure and corridor share the same source in every lighting state. */
export function renderSceneArt({ ambient = true, seating = true } = {}) {
  return `<div class="scene-world" aria-hidden="true">
    <svg class="scene-defs"><defs>
      <filter id="terminal-alpha" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -3 6 -3 0 1" />
        <feComponentTransfer><feFuncA type="linear" slope="4" intercept="0" /></feComponentTransfer>
      </filter>
      <filter id="skyline-alpha" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -24 0 24 0 -0.4" result="cool" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  24 0 -24 0 -0.4" result="warm" />
        <feComposite in="cool" in2="warm" operator="arithmetic" k2="1" k3="1" result="colorMask" />
        <feComposite in="SourceGraphic" in2="colorMask" operator="in" />
      </filter>
      <filter id="skyline-lights" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  12 0 -12 0 -0.2" result="warmLights" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 12 -12 0 -0.2" result="greenLights" />
        <feComposite in="warmLights" in2="greenLights" operator="arithmetic" k2="1" k3="1" result="litMask" />
        <feComposite in="SourceGraphic" in2="litMask" operator="in" />
      </filter>
    </defs></svg>
    <div class="outdoors">
      ${sprite('sky')}
      ${sprite('clouds', 'cloud cloud-far')}
      ${sprite('clouds', 'cloud cloud-near')}
      <div class="city">${skyline('skyline')}${skyline('city-lights')}</div>
      ${sprite('apron')}
      <div class="taxiway-lights">${[8, 18, 31, 48, 62, 79, 91].map((x, i) => `<i style="left:${x}%;top:${i % 2 ? 62 : 35}%"></i>`).join('')}</div>
      ${ambient ? `<div class="aircraft-track" data-ambient="aircraft">${sprite('aircraft')}</div>${groundRoutes.map(({ name }) => `<div class="ground-vehicle vehicle-${name}" data-ambient="${name}">${sprite(name)}</div>`).join('')}` : ''}
    </div>
    <div class="architecture">
      ${architecture('terminal-upper', '0 0 1536 160')}
      ${architecture('terminal-middle', '0 160 1536 480')}
      ${architecture('terminal-floor', '0 640 1536 384')}
    </div>
    ${seating ? `<div class="seating">${sprite('seats-front', 'seats seats-left-far')}${sprite('seats-back', 'seats seats-right-far')}${sprite('seats-front', 'seats seats-left')}${sprite('seats-back', 'seats seats-right')}</div>` : ''}
  </div>`
}
