import './style.css'

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 800;
document.querySelector('#app')?.appendChild(canvas)

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice();

const canvasContext = canvas.getContext('webgpu');

canvasContext.configure({
  format:navigator.gpu.getPreferredCanvasFormat(),
  device:device
})

const encoder = device.createCommandEncoder();
encoder.beginRenderPass({
  colorAttachments:[{
    view:canvasContext.getCurrentTexture().createView(),
    clearValue:{r:0.7,g:0.7,b:0.7,a:1},
    loadOp:'clear',
    storeOp:'store'
  }]
}).end()
device.queue.submit([encoder.finish()])

