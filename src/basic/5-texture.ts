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

const kTextureWidth = 5;
const kTextureHeight = 7;
const _ = [255, 0, 0, 255]; // red
const y = [255, 255, 0, 255]; // yellow
const b = [0, 0, 255, 255]; // blue
//prettier-ignore
const textureData = new Uint8Array([
    b, _, _, _, _,
    _, y, y, y, _,
    _, y, _, _, _,
    _, y, y, _, _,
    _, y, _, _, _,
    _, y, _, _, _,
    _, _, _, _, _,
  ].flat());

const texture = device.createTexture({
  label: "texture",
  format: "rgba8unorm",
  size: [kTextureWidth, kTextureHeight],
  usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
});

device.queue.writeTexture(
  { texture },
  textureData,
  { bytesPerRow: kTextureWidth * 4 },
  { width: kTextureWidth, height: kTextureHeight }
);

const sampler = device.createSampler();

const aTriangle = new Float32Array([
  -0.8, -0.8, 1, 0, 0, 1, 0, 0,
  0.8, -0.8, 0, 1, 0, 1, 1, 0,
  0.8, 0.8, 0, 0, 1, 1, 1, 1,

  -0.8, -0.8, 1, 0, 0, 1, 0, 0,
  0.8, 0.8, 0, 1, 0, 1, 1, 1,
  -0.8, 0.8, 0, 0, 1, 1, 0, 1
]);

const triangleGpuBuffer = device.createBuffer({
  label: "GPU buffer for triangle vertex",
  size: aTriangle.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
});
const triangleGpuBufferLayout: GPUVertexBufferLayout = {
  arrayStride: (32 / 8) * 8, // { x: 32f, y: 32f, r: 32f, g: 32f, b: 32f, a: 32f, u: 32f, v: 32f }
  attributes: [
    {
      format: "float32x2",
      offset: 0,
      shaderLocation: 0,
    },
    {
      format: "float32x4",
      offset: (32 / 8) * 2,
      shaderLocation: 1,
    },
    {
      format: "float32x2",
      offset: (32 / 8) * 6,
      shaderLocation: 2,
    },
  ],
};

device.queue.writeBuffer(triangleGpuBuffer, 0, aTriangle);

const shaderModule = device.createShaderModule({
  label: "shaders",
  code: `
struct VertextOutput {
  @builtin(position) pos: vec4f,
  @location(0) color: vec4f,
  @location(1) tec: vec2f,
}

@group(0) @binding(0) var mSampler: sampler;
@group(0) @binding(1) var mTexture: texture_2d<f32>;

@vertex
fn vertexMain(
  @location(0) pos: vec2f,
  @location(1) color: vec4f,
  @location(2) uv: vec2f) -> VertextOutput {
  var res: VertextOutput;
  res.pos = vec4f(pos, 0, 1);
  res.color = color;
  res.tec = uv;
  return res;
}

@fragment
fn fragmentMain(input: VertextOutput) -> @location(0) vec4f {
return textureSample(mTexture, mSampler, input.tec) * input.color;
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
  label:'bind group',
  layout:pipeline.getBindGroupLayout(0),
  entries:[
    {binding: 0,resource:sampler},
    {binding: 1,resource:texture.createView()}
  ]
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
pass.draw(6);
pass.end();
device.queue.submit([encoder.finish()]);
