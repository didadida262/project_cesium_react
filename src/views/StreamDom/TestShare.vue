<!-- <template>
  <div
    class="px-[20px] py-[20px] w-full h-full bg-[rgb(30,28,28)] flex flex-col gap-y-[20px]"
  >
    <Button
      text="开启共享"
      classname="text-[#FFFFFF] bg-[#000000]"
      :onClick="onClick"
    />
    <div class="stats">
      <p>已同步: {{ framesSynced }} 帧</p>
      <p>延迟: {{ latency }}ms</p>
      <p>连接状态: {{ connectionStatus }}</p>
    </div>
    <video
      ref="videoRef"
      id="videoPlayer"
      controls
      class="w-full h-[calc(50%)]"
    ></video>
  </div>
</template> -->

<template>
  <div
    class="px-[20px] py-[20px] w-full h-full bg-[rgb(30,28,28)] flex flex-col gap-y-[20px] text-[white]"
  >
    <div class="w-full h-[100px] flex gap-x-[20px]">
      <Button
        text="开启共享"
        :on-click="startSharing"
      />
      <Button
        text="停止共享"
        :on-click="stopSharing"
      />
    </div>
    <div class="w-full h-[100px] flex gap-x-[20px]">
      <!-- 左侧：被共享区域 -->
      <div
        ref="sourceRef"
        class="source-box"
      >
        <h2 class="">
          左侧区域（共享源）
        </h2>
        <p>你可以滚动、播放音频或视频</p>
        <p>你可以滚动、播放音频或视频</p>
        <p>你可以滚动、播放音频或视频</p>
        <p>你可以滚动、播放音频或视频</p>
        <p>你可以滚动、播放音频或视频</p>
        <p>你可以滚动、播放音频或视频</p>
        <p>你可以滚动、播放音频或视频</p>
        <p>你可以滚动、播放音频或视频</p>
        <p>你可以滚动、播放音频或视频</p>
        <div style="height: 1000px" />
      </div>

      <!-- 右侧：共享播放区域 -->
      <div class="target-box">
        <h2>右侧区域（接收端）</h2>
        <video
          ref="videoRef"
          autoplay
          muted
          playsinline
          controls
          style="width: 300px"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import html2canvas from 'html2canvas'
import Button from '../../components/ButtonComponent.vue'

const sourceRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let stream: MediaStream
let recorder: MediaRecorder
let intervalId: number | undefined
let senderSocket: WebSocket

// 接收播放逻辑
let mediaSource: MediaSource
let sourceBuffer: SourceBuffer | null = null
let queue: ArrayBuffer[] = []
let sourceBufferReady = false
let mediaSourceOpen = false

const fps = 10

function initCanvas(el: HTMLElement) {
  canvas = document.createElement('canvas')
  canvas.width = el.offsetWidth
  canvas.height = el.offsetHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法获取 canvas context')
  ctx = context
}

async function updateCanvas() {
  const snapshot = await html2canvas(sourceRef.value!)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(snapshot, 0, 0, canvas.width, canvas.height)
}

function startSharing() {
  if (!sourceRef.value) return

  initCanvas(sourceRef.value)
  senderSocket = new WebSocket('ws://localhost:4000')

  senderSocket.onopen = () => {
    intervalId = window.setInterval(updateCanvas, 1000 / fps)
    stream = canvas.captureStream(fps)
    recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp8',
    })

    recorder.ondataavailable = (e) => {
      console.log('[Sender] Data available:', e.data.size) // 🔍 输出数据大小
      if (e.data.size > 0 && senderSocket.readyState === WebSocket.OPEN) {
        senderSocket.send(e.data)
      }
    }

    recorder.start(200) // 每 200ms 发送一帧
  }
}

function stopSharing() {
  if (intervalId) clearInterval(intervalId)
  recorder?.stop()
  stream?.getTracks().forEach((track) => track.stop())
  senderSocket?.close()
}

onMounted(() => {
  const receiverSocket = new WebSocket('ws://localhost:4000')
  receiverSocket.binaryType = 'arraybuffer'

  receiverSocket.onmessage = (event) => {
    const data = event.data
    if (sourceBufferReady) {
      appendBuffer(data)
    } else {
      queue.push(data)
    }
  }

  mediaSource = new MediaSource()
  videoRef.value!.src = URL.createObjectURL(mediaSource)

  mediaSource.addEventListener('sourceopen', () => {
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs=vp8')
    sourceBuffer.mode = 'segments'
    sourceBuffer.addEventListener('updateend', flushQueue)
    sourceBufferReady = true
    flushQueue()
  })

  onUnmounted(() => {
    receiverSocket?.close()
  })
})

function appendBuffer(data: ArrayBuffer) {
  if (!sourceBuffer) return
  if (sourceBuffer.updating || queue.length > 0) {
    queue.push(data)
  } else {
    sourceBuffer.appendBuffer(data)
  }
}

function flushQueue() {
  if (!sourceBuffer || sourceBuffer.updating) return
  if (queue.length > 0) {
    const data = queue.shift()
    if (data) sourceBuffer.appendBuffer(data)
  }
}
</script>

<style scoped>
.source-box {
  width: 320px;
  height: 500px;
  overflow: auto;
  border: 2px solid #3f3f3f;
  padding: 10px;
}

.target-box {
  width: 320px;
  height: 500px;
  border: 2px dashed #2d6cdf;
  padding: 10px;
}
</style>
