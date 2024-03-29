import "./style.css";
import {
  initGpu,
  getGpuContext,
  assertContext,
  initCanvas,
} from "./utils/init";

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 800;
document.querySelector("#app")?.appendChild(canvas);

await initGpu();
const { device } = assertContext(getGpuContext());
initCanvas(canvas, device);

const encoder = device.createCommandEncoder();
encoder
  .beginRenderPass({
    colorAttachments: [
      {
        view: canvas.getContext("webgpu")!.getCurrentTexture().createView(),
        clearValue: { r: 0.7, g: 0.7, b: 0.7, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  })
  .end();
device.queue.submit([encoder.finish()]);
