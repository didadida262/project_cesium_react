import html2canvas from 'html2canvas'

export class ShareStreamer {
  private element: HTMLElement
  private ws: WebSocket
  private stream?: MediaStream
  private recorder?: MediaRecorder
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private intervalId?: number

  constructor(element: HTMLElement, wsUrl: string) {
    this.element = element
    this.ws = new WebSocket(wsUrl)

    // 初始化空 canvas
    this.canvas = document.createElement('canvas')
    this.canvas.width = element.offsetWidth
    this.canvas.height = element.offsetHeight

    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context not supported')
    this.ctx = ctx
  }

  public async startSharing(fps = 10) {
    // 每帧抓取 element 的图像并画到 canvas 上
    const updateCanvas = async () => {
      const snapshotCanvas = await html2canvas(this.element)
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(
        snapshotCanvas,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      )
    }

    this.intervalId = window.setInterval(updateCanvas, 1000 / fps)

    this.stream = this.canvas.captureStream(fps)
    this.recorder = new MediaRecorder(this.stream, {
      mimeType: 'video/webm; codecs=vp8', // 用 vp8 更通用
    })

    this.recorder.ondataavailable = (e: BlobEvent) => {
      console.log('Recorded chunk', e.data)
      if (e.data.size > 0 && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(e.data)
      }
    }

    this.recorder.start(250) // 每250ms生成一次 chunk
    console.log('Sharing started...')
  }

  public stopSharing() {
    if (this.intervalId) clearInterval(this.intervalId)
    this.recorder?.stop()
    this.stream?.getTracks().forEach((track) => track.stop())
    console.log('Sharing stopped.')
  }
}
