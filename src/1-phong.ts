import "./style.css";
import { FpsCamera, registerKeyboard } from "./utils/fps";
import {
  initGpu,
  getGpuContext,
  assertContext,
  initCanvas,
} from "./utils/init";
import { Matrix4 } from "@math.gl/core";
import { getProjection } from "./utils/projection";

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 800;
document.querySelector("#app")?.appendChild(canvas);

await initGpu();
const { device } = assertContext(getGpuContext());
initCanvas(canvas, device);

const aCube = new Float32Array([
  -0.2, -0.2, 0.2, 0, 0, 1, 0, 0, 
  0.2, -0.2, 0.2, 0, 0, 1, 1, 0, 
  0.2, 0.2, 0.2, 0, 0, 1, 1, 1, 
  -0.2, -0.2, 0.2, 0, 0, 1, 0, 0, 
  0.2, 0.2, 0.2, 0, 0, 1, 1, 1, 
  -0.2, 0.2, 0.2, 0, 0, 1, 0, 1,

  -0.2, 0.2, 0.2, 0, 1, 0,  0, 0, 
  0.2, 0.2, 0.2, 0, 1, 0,  1, 0, 
  0.2, 0.2, 0, 0, 1, 0,  1, 1, 
  -0.2, 0.2, 0.2, 0, 1, 0,  0, 0, 
  0.2, 0.2, 0, 0, 1, 0, 1, 1, 
  -0.2, 0.2, 0, 0, 1, 0, 0, 1,

  0.2, -0.2, 0.2, 1, 0, 0, 0, 0, 
  0.2, -0.2, 0, 1, 0, 0, 1, 0, 
  0.2, 0.2, 0, 1, 0, 0, 1, 1, 
  0.2, -0.2, 0.2, 1, 0, 0, 0, 0, 
  0.2, 0.2, 0, 1, 0, 0, 1, 1, 
  0.2, 0.2, 0.2, 1, 0, 0, 0, 1,

  0.2, -0.2, 0, 0, 0, -1,  0, 0, 
  -0.2, -0.2, 0, 0, 0, -1,  1, 0, 
  -0.2, 0.2, 0, 0, 0, -1,  1, 1, 
  0.2, -0.2, 0, 0, 0, -1,  0, 0, 
  -0.2, 0.2, 0, 0, 0, -1,  1,1, 
  0.2, 0.2, 0, 0, 0, -1,  0, 1,

  -0.2, -0.2, 0, 0, -1, 0, 0, 0, 
  0.2, -0.2, 0, 0, -1, 0, 1, 0, 
  0.2, -0.2, 0.2, 0, -1, 0, 1, 1, 
  -0.2, -0.2, 0, 0, -1, 0, 0, 0, 
  0.2, -0.2, 0.2, 0, -1, 0, 1, 1, 
  -0.2, -0.2, 0.2, 0, -1, 0, 0, 1,

  -0.2, -0.2, 0, -1, 0, 0, 0, 0, 
  -0.2, -0.2, 0.2, -1, 0, 0, 1, 0, 
  -0.2, 0.2, 0.2, -1, 0, 0, 1, 1, 
  -0.2, -0.2, 0, -1, 0, 0, 0, 0, 
  -0.2, 0.2, 0.2, -1, 0, 0, 1, 1, 
  -0.2, 0.2, 0, -1, 0, 0, 0, 1,
]);

const cubeGpuBuffer = device.createBuffer({
  label: "GPU buffer for cube vertex",
  size: aCube.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
});
const CubeGpuBufferLayout: GPUVertexBufferLayout = {
  arrayStride: (32 / 8) * 8, // { x: 32f, y: 32f, z: 32f, nx: 32f, ny: 32f, nz: 32f, u: 32f, v: 32f }
  attributes: [
    {
      format: "float32x3",
      offset: 0,
      shaderLocation: 0,
    },
    {
      format: "float32x3",
      offset: (32 / 8) * 3,
      shaderLocation: 1,
    },
    {
      format: "float32x2",
      offset: (32 / 8) * 6,
      shaderLocation: 2,
    },
  ],
};

device.queue.writeBuffer(cubeGpuBuffer, 0, aCube);

const cubeInstances = new Float32Array([0,0,0,0,0,0,1,1,1,
  0.5,0.5,-1,0,0,0,0.2,0.2,0.2]);
const cubeInstanceGpuBuffer = device.createBuffer({
  label: "GPU instance buffer for cube vertex",
  size: cubeInstances.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
});
const CubeInstanceGpuBufferLayout: GPUVertexBufferLayout = {
  arrayStride: (32 / 8) * 9,
  stepMode: "instance",
  attributes: [
    {
      format: "float32x3",
      offset: 0,
      shaderLocation: 3,
    },
    {
      format: "float32x3",
      offset: (32 / 8) * 3,
      shaderLocation: 4,
    },
    {
      format: "float32x3",
      offset: (32 / 8) * 6,
      shaderLocation: 5,
    },
  ],
};
device.queue.writeBuffer(cubeInstanceGpuBuffer,0,cubeInstances);

const view = new Float32Array(16);
const projection = new Float32Array(16);

const viewUniformBuffer = device.createBuffer({
  label: "trans matrix",
  size: view.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
});
device.queue.writeBuffer(viewUniformBuffer, 0, view);

const projectionUniformBuffer = device.createBuffer({
  label: "projection matrix",
  size: projection.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
});
device.queue.writeBuffer(projectionUniformBuffer, 0, projection);

const lightPosArray = new Float32Array([0.5,0.5,-1]);
const lightPosUniformBuffer = device.createBuffer({
  label: "light pos",
  size: lightPosArray.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
})
device.queue.writeBuffer(lightPosUniformBuffer,0,lightPosArray)

const viewPosArray = new Float32Array([0,0,0]);
const viewPosUniformBuffer = device.createBuffer({
  label: "view pos",
  size: viewPosArray.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
})
device.queue.writeBuffer(viewPosUniformBuffer,0,viewPosArray)

const shaderModule = device.createShaderModule({
  label: "shaders",
  code: `
struct Vertext {
  @builtin(position) pos: vec4f,
  @location(0) fragPos: vec4f,
  @location(1) norm: vec4f,
  @location(2) tec: vec2f,
}

@group(0) @binding(0) var<uniform> view: mat4x4f;
@group(0) @binding(1) var<uniform> projection: mat4x4f;
@group(0) @binding(2) var<uniform> lightPos: vec3f;
@group(0) @binding(3) var<uniform> viewPos: vec3f;

const ambint: f32 = 0.1;
const specularStrength: f32 = 0.5;

@vertex
fn vertexMain(
  @location(0) pos: vec3f,
  @location(1) norm: vec3f,
  @location(2) uv: vec2f,
  @location(3) trans: vec3f,
  @location(4) rotate: vec3f,
  @location(5) scale: vec3f) -> Vertext {
  var res: Vertext;
  res.pos = projection * view * vec4f(scale * pos+trans, 1);
  res.fragPos = vec4f(scale * pos+trans, 1);
  res.norm = vec4f(norm, 0);
  res.tec = uv;
  return res;
}

@fragment
fn fragmentMain(input: Vertext) -> @location(0) vec4f {
  let lightDir: vec3f = normalize(lightPos-input.fragPos.xyz);
  let viewDir: vec3f = normalize(viewPos-input.fragPos.xyz);
  let norm: vec3f = normalize(input.norm.xyz);
  let reflectDir: vec3f = reflect(-lightDir, norm);

  let diff: f32 = max(dot(norm,lightDir),0);
  let spec: f32 = pow(max(dot(viewDir, reflectDir), 0.0), 32) * specularStrength;
  let res = (ambint + diff + spec) * vec3f(1,0.5,0.31);
  return vec4f(res,1);
}
`,
});

const pipeline = device.createRenderPipeline({
  label: "pipeline",
  layout: "auto",
  vertex: {
    module: shaderModule,
    entryPoint: "vertexMain",
    buffers: [CubeGpuBufferLayout,CubeInstanceGpuBufferLayout],
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fragmentMain",
    targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
  },
  depthStencil: {
    depthWriteEnabled: true,
    depthCompare: "less",
    format: "depth24plus",
  },
});

const bindGroup = device.createBindGroup({
  label: "bind group",
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: viewUniformBuffer } },
    { binding: 1, resource: { buffer: projectionUniformBuffer } },
    { binding: 2, resource: { buffer: lightPosUniformBuffer } },
    { binding: 3, resource: { buffer: viewPosUniformBuffer } },
  ],
});

let lastFrameTime: number | undefined = undefined;

const camera = new FpsCamera();
camera.positionXyz(0, 0, 1);
camera.lookAtXyz(0, 0, -1);

const depthTexture = device.createTexture({
  label: "depth texture",
  size: { width: canvas.width, height: canvas.height },
  format: "depth24plus",
  usage: GPUTextureUsage.RENDER_ATTACHMENT,
});

function drawAccordingToTimestamp(time: number) {
  if (lastFrameTime === undefined) {
    lastFrameTime = time;
  }
  const dt = time - lastFrameTime;

  camera.update(dt);
  const lookAtMatrix = camera.mat();
  new Matrix4(lookAtMatrix).toArray(view);
  getProjection().toArray(projection);
  device.queue.writeBuffer(viewUniformBuffer, 0, view);
  device.queue.writeBuffer(projectionUniformBuffer, 0, projection);
  device.queue.writeBuffer(viewPosUniformBuffer,0,new Float32Array([camera.x,camera.y,camera.z]))

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: canvas.getContext("webgpu")!.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthClearValue: 1,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  });
  pass.setPipeline(pipeline);
  pass.setVertexBuffer(0, cubeGpuBuffer);
  pass.setVertexBuffer(1,cubeInstanceGpuBuffer);
  pass.setBindGroup(0, bindGroup);
  pass.draw(6 * 6);
  pass.end();
  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(drawAccordingToTimestamp);
}

registerKeyboard();
requestAnimationFrame(drawAccordingToTimestamp);
