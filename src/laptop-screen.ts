import * as THREE from 'three'

const width = 603
const height = 371
const resolution = 3

/** A sharp, opaque portfolio preview that shares the terminal's depth buffer. */
export function createLaptopScreenTexture(
  element: HTMLElement,
  onChange: () => void,
): { texture: THREE.CanvasTexture; dispose(): void } {
  const canvas = element.ownerDocument.createElement('canvas')
  canvas.width = width * resolution
  canvas.height = height * resolution
  const context = canvas.getContext('2d')
  if (!context) throw new Error('The laptop preview requires a canvas context')

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  let disposed = false
  const text = (selector: string) => element.querySelector(selector)?.textContent?.trim() ?? ''
  const description = element.querySelector('.screen-description')?.cloneNode(true) as
    | HTMLElement
    | undefined
  description?.querySelectorAll('br').forEach((br) => br.replaceWith('\n'))
  const descriptionLines = description?.textContent?.trim().split('\n') ?? []

  function draw() {
    if (disposed || !context) return
    context.setTransform(resolution, 0, 0, resolution, 0, 0)
    context.fillStyle = '#f6f5f1'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#262822'
    context.textBaseline = 'alphabetic'
    context.textAlign = 'left'
    context.font = '10px Georgia, "Times New Roman", serif'
    context.fillText(text('.screen-masthead > span:first-child'), 24, 33)
    context.textAlign = 'right'
    context.font = '8px Inter, Arial, sans-serif'
    context.fillText(text('.screen-masthead > span:last-child'), width - 24, 32)

    // Match the serif headline's negative tracking without relying on the
    // newer canvas letterSpacing property being supported by every browser.
    context.font = '78px Georgia, "Times New Roman", serif'
    context.textAlign = 'left'
    const name = text('.screen-name')
    const characters = Array.from(name)
    const nameWidth = context.measureText(name).width - 4 * (characters.length - 1)
    let prefix = ''
    characters.forEach((character, index) => {
      const x = (width - nameWidth) / 2 + context.measureText(prefix).width - 4 * index
      context.fillText(character, x, 153)
      prefix += character
    })
    context.textAlign = 'center'
    context.font = '15px Georgia, "Times New Roman", serif'
    context.fillText(text('.screen-role'), width / 2, 199)
    context.font = '10px Inter, Arial, sans-serif'
    descriptionLines.forEach((line, index) => {
      context.fillText(line.trim(), width / 2, 235 + index * 18)
    })

    context.font = '9px Inter, Arial, sans-serif'
    const label = text('.screen-cta')
    const labelWidth = context.measureText(label).width
    const buttonWidth = labelWidth + 59
    const buttonX = (width - buttonWidth) / 2
    context.fillStyle = '#132b42'
    context.fillRect(buttonX, 281, buttonWidth, 36)
    context.fillStyle = '#ffffff'
    context.textAlign = 'left'
    context.fillText(label, buttonX + 19, 302)
    const arrowX = buttonX + 19 + labelWidth + 9
    context.strokeStyle = '#ffffff'
    context.lineWidth = 0.85
    context.beginPath()
    context.moveTo(arrowX + 3.5, 302.5)
    context.lineTo(arrowX + 8.5, 297.5)
    context.moveTo(arrowX + 3.5, 297.5)
    context.lineTo(arrowX + 8.5, 297.5)
    context.lineTo(arrowX + 8.5, 302.5)
    context.stroke()
    texture.needsUpdate = true
  }

  draw()
  void element.ownerDocument.fonts?.ready.then(() => {
    if (disposed) return
    draw()
    onChange()
  })

  return {
    texture,
    dispose() {
      if (disposed) return
      disposed = true
      texture.dispose()
    },
  }
}
