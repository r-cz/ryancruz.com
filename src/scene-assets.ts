import { assetURL, sceneAssets } from './scene-art'

/** Essential artwork gates enhancement; optional ambient sprites may arrive later. */
export function loadSceneArtwork(onOptionalFailure: (name: string) => void) {
  let disposed = false
  const cancelLoads: (() => void)[] = []
  const essential: Promise<void>[] = []
  for (const name of sceneAssets) {
    const optional = name === 'aircraft' || name === 'clouds'
    const load = new Promise<void>((resolve, reject) => {
      const image = new window.Image()
      let settled = false
      const finish = (failed = false) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeout)
        image.onload = image.onerror = null
        if (disposed) {
          resolve()
          return
        }
        if (failed && optional) onOptionalFailure(name)
        if (failed && !optional) reject(new Error(`Scene artwork unavailable: ${name}`))
        else resolve()
      }
      // A stalled request must not leave a visitor behind an endless loading screen.
      const timeout = window.setTimeout(() => finish(true), 12_000)
      image.onload = () => finish()
      image.onerror = () => finish(true)
      cancelLoads.push(() => finish())
      image.src = assetURL(name)
      if (image.complete) finish(image.naturalWidth === 0)
    })
    if (!optional) essential.push(load)
  }
  return {
    ready: Promise.all(essential).then(() => {}),
    dispose() {
      disposed = true
      cancelLoads.forEach((cancel) => cancel())
    },
  }
}
