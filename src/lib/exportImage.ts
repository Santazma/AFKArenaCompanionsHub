import { toPng } from 'html-to-image'

// Renders a DOM node to a PNG and triggers a download. All imagery on the board
// (framed hero icons, boss art) is served from a CORS-enabled CDN with
// crossOrigin="anonymous", so the canvas doesn't get tainted.
export async function downloadNodeAsPng(node: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#0b0713',
  })
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.click()
}
