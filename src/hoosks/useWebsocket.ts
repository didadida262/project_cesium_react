import { ref, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const useWebSocket = (url: string, onMessage: (data: any) => void) => {
  const socket = ref<WebSocket | null>(null)
  const reconnectInterval = 5000
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let isUnmounted = false

  const connect = () => {
    try {
      socket.value = new WebSocket(url)

      socket.value.onopen = () => {
        Message.success('WebSocket 连接已打开')
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
          reconnectTimer = null
        }
      }

      socket.value.onmessage = (event) => {
        try {
          console.log('event.data>>>', event.data)
          //   const jsonData = JSON.parse(event.data);
          onMessage(event.data) // 调用回调函数将解析后的 JSON 数据传递给组件
        } catch (error) {
          console.error('解析 JSON 数据时出错:', error)
          Message.error('解析 JSON 数据时出错')
          onMessage(event.data) // 如果解析失败，传递原始字符串数据
        }
      }

      socket.value.onclose = () => {
        console.log('WebSocket 连接已关闭')
        if (!isUnmounted) {
          Message.warning('尝试重连...')
          reconnect()
        }
      }

      socket.value.onerror = (error) => {
        console.error('WebSocket 发生错误:', error)
        Message.error('WebSocket 发生错误')
        socket.value?.close()
      }
    } catch (error) {
      Message.error('创建 WebSocket 连接时出错')
      console.error('创建 WebSocket 连接时出错:', error)
    }
  }

  const reconnect = () => {
    if (!reconnectTimer && !isUnmounted) {
      reconnectTimer = setTimeout(() => {
        connect()
      }, reconnectInterval)
    }
  }

  const sendMessage = (message: string) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(message)
    } else {
      Message.error('无法发送消息，WebSocket 连接未打开')
      console.error('无法发送消息，WebSocket 连接未打开')
    }
  }

  const close = () => {
    if (socket.value) {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      console.log('正在关闭 WebSocket 连接...')
      Message.info('正在关闭 WebSocket 连接...')

      try {
        socket.value.close()
        Message.info('WebSocket 连接已关闭')
      } catch (error) {
        console.error('关闭 WebSocket 连接时出错:', error)
        Message.info('关闭 WebSocket 连接时出错')
      }
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    isUnmounted = true
    close()
  })

  return {
    sendMessage,
    close,
  }
}

export default useWebSocket
