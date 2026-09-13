/** Generated art stays independent of the HTML screen and moving sprites. */
export const sceneAssets = [
  'sky',
  'skyline',
  'apron',
  'terminal',
  'seats-front',
  'seats-back',
  'table',
  'laptop',
  'aircraft',
  'clouds',
] as const

// Keep an art revision with the consuming layout to avoid stale cached sprites.
export const assetURL = (name: string) => `/scene/${name}.webp?rev=illustrated-1`
const sprite = (name: string, className = name) =>
  `<img class="art ${className}" src="${assetURL(name)}" alt="" draggable="false" />`

// The generated architecture retained an opaque matte in its glazing. These
// measured pane openings mask the matte without repainting the original art.
const panes = [
  [0, 167, 30, 112],
  [139, 167, 44, 113],
  [210, 167, 105, 121],
  [327, 167, 259, 355],
  [597, 167, 290, 355],
  [898, 167, 236, 355],
  [1145, 167, 219, 355],
  [1376, 167, 33, 355],
  [1516, 167, 20, 355],
  [0, 301, 29, 216],
  [194, 330, 89, 133],
  [194, 475, 89, 8],
  [256, 488, 22, 101],
  [0, 532, 28, 57],
  [327, 532, 259, 60],
  [597, 532, 290, 60],
  [898, 532, 236, 60],
  [1145, 532, 219, 60],
  [1376, 532, 33, 60],
  [1516, 532, 20, 60],
]
const architecture = (className: string, box: string) =>
  `<svg class="art ${className}" viewBox="${box}" preserveAspectRatio="none"><image href="${assetURL('terminal')}" width="1536" height="1024" mask="url(#terminal-panes)" /></svg>`
const skyline = (className: string) =>
  `<svg class="art ${className}" viewBox="0 0 1536 512" preserveAspectRatio="none"><image href="${assetURL('skyline')}" width="1536" height="512" filter="url(#${className === 'city-lights' ? 'skyline-lights' : 'skyline-alpha'})" /></svg>`

const column = (side: 'left' | 'right', cap: string, display: string) => {
  const part = (className: string, box: string) =>
    `<svg class="${className}" viewBox="${box}" preserveAspectRatio="none"><image href="${assetURL('terminal')}" width="1536" height="1024" /></svg>`
  return `<div class="mobile-column column-${side}">${part('column-fill', '50 367 70 48')}${part('column-cap', cap)}${part('gate-display', display)}</div>`
}

export function renderSceneArt() {
  return `<div class="scene-world" aria-hidden="true">
    <svg class="scene-defs"><defs>
      <mask id="terminal-panes" maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
        <rect width="1536" height="1024" fill="white" />
        ${panes.map(([x, y, width, height]) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="black" />`).join('')}
      </mask>
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
      <div class="aircraft-track">${sprite('aircraft')}</div>
    </div>
    <div class="architecture">
      ${architecture('terminal-upper', '0 0 1536 160')}
      ${architecture('terminal-middle', '0 160 1536 480')}
      ${architecture('terminal-floor', '0 640 1536 384')}
      ${column('left', '31 72 106 100', '35 175 89 184')}
      ${column('right', '1412 72 106 100', '1425 175 90 184')}
    </div>
    <div class="seating">
      ${sprite('seats-front', 'seats seats-left-far')}${sprite('seats-back', 'seats seats-right-far')}
      ${sprite('seats-front', 'seats seats-left')}${sprite('seats-back', 'seats seats-right')}
    </div>
    ${sprite('table')}
    <div class="laptop-shell">${sprite('laptop')}</div>
  </div>`
}
