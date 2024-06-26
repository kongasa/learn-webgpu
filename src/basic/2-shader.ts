import "./style.css";
import {
  initGpu,
  getGpuContext,
  assertContext,
  initCanvas,
} from "../utils/init";

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 800;
document.querySelector("#app")?.appendChild(canvas);

await initGpu();
const { device } = assertContext(getGpuContext());
initCanvas(canvas, device);

const aTriangle = new Float32Array([-0.8, -0.8, 0.8, -0.8, 0, 0.8]);

const triangleGpuBuffer = device.createBuffer({
  label: "GPU buffer for triangle vertex",
  size: aTriangle.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
});
const triangleGpuBufferLayout: GPUVertexBufferLayout = {
  arrayStride: (32 / 8) * 2, // { x: 32f, y: 32f }
  attributes: [
    {
      format: "float32x2",
      offset: 0,
      shaderLocation: 0,
    },
  ],
};

device.queue.writeBuffer(triangleGpuBuffer, 0, aTriangle);

const color = new Float32Array([0, 0, 0, 1]);

const colorGpuBuffer = device.createBuffer({
  label: "color uniform",
  size: color.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
});

device.queue.writeBuffer(colorGpuBuffer, 0, color);

const shaderModule = device.createShaderModule({
  label: "shaders",
  code: `
@group(0) @binding(0) var<uniform> color:vec4f;

@vertex
fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
return vec4f(pos, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
return color;
}
`,
});

const pipeline = device.createRenderPipeline({
  label: "pipeline",
  layout: "auto",
  vertex: {
    module: shaderModule,
    entryPoint: "vertexMain",
    buffers: [triangleGpuBufferLayout],
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fragmentMain",
    targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
  },
});
const bindGroup = device.createBindGroup({
  label: "color bind group",
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: { buffer: colorGpuBuffer },
    },
  ],
});

const encoder = device.createCommandEncoder();
const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: canvas.getContext("webgpu")!.getCurrentTexture().createView(),
      clearValue: { r: 0.7, g: 0.7, b: 0.7, a: 1 },
      loadOp: "clear",
      storeOp: "store",
    },
  ],
});
pass.setPipeline(pipeline);
pass.setVertexBuffer(0, triangleGpuBuffer);
pass.setBindGroup(0,bindGroup);
pass.draw(3);
pass.end();
device.queue.submit([encoder.finish()]);
