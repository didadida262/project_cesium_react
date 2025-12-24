<template>
  <div
    class="px-[20px] py-[20px] w-full h-full bg-[rgb(18,20,22)] flex flex-col gap-y-[20px] text-[white]"
  >
    <Button
      text="开启共享"
      :on-click="startSharing"
    />
    <div class="w-full max-h-full">
      <img
        :src="url"
        alt=""
      >
    </div>
  </div>
</template>


<script lang="ts" setup>
import html2canvas from 'html2canvas'
import Button from '../../components/ButtonComponent.vue'
import { ref } from 'vue'

const url = ref('') as any

const startSharing = () => {
    setInterval(() => {
        convertToCanvas()
    }, 30)
}

// 将div转换为canvas
const convertToCanvas = async () => {
    const dom = document.getElementById('shareArea')
    console.log('dome>>>', dom)
    if (!dom) return 
  try {
    // 使用html2canvas库将div转换为canvas
    const canvas = await html2canvas(dom, {
      scale: 2, // 提高清晰度
      useCORS: true, // 尝试加载跨域资源
      logging: false, // 关闭日志
    })
    const res = canvas.toDataURL('image/png')
    url.value = res

  } catch (error: any) {
    console.error('转换失败:', error)

  } finally {
  }
}

// 

</script>