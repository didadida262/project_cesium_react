export class SharePlayer {
  private ws!: WebSocket
  private video!: HTMLVideoElement
  private onMessageBound!: (ev: MessageEvent) => void

  /**
   * 启动播放。serverUrl 是 WebSocket 服务地址，videoElement 是用于播放的 <video> 元素。
   */
  public start(serverUrl: string, videoElement: HTMLVideoElement) {
    this.video = videoElement
    this.ws = new WebSocket(serverUrl)
    // 接收二进制数据
    this.ws.binaryType = 'arraybuffer'
    // 消息回调：将接收到的 ArrayBuffer 转为 Blob 播放
    this.onMessageBound = (ev: MessageEvent) => {
      const arrayBuffer = ev.data as ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      this.video.src = url
      this.video.play()
      // 释放 URL 对象，以免内存泄漏
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    }
    this.ws.onmessage = this.onMessageBound
    this.ws.onerror = (err) => {
      console.error('WebSocket 错误', err)
    }
  }

  /**
   * 停止播放，关闭连接并清空视频源。
   */
  public stop() {
    if (this.ws) {
      this.ws.close()
    }
    if (this.video) {
      this.video.src = ''
    }
  }
}
