export interface DeviceContext {
  adapter: GPUAdapter | undefined | null;
  device: GPUDevice | undefined | null;
}

export const globalDeviceContext: DeviceContext = {
  adapter: undefined,
  device: undefined,
};

const contextMap: Map<symbol, DeviceContext> = new Map();

export function createDeviceContext(): symbol {
  const sym = Symbol();
  contextMap.set(sym, {
    adapter: undefined,
    device: undefined,
  });
  return sym;
}

export function getGpuContext(sym?: symbol): DeviceContext {
  if (!sym) {
    return globalDeviceContext;
  }
  const res = contextMap.get(sym);
  if (!res) {
    throw new Error("find no context");
  }
  return res;
}

export async function initGpu(context?: DeviceContext) {
  if (!navigator.gpu) {
    throw new Error("browser does not support WebGPU.");
  }
  if (!context) {
    context = globalDeviceContext;
  }
  context.adapter = await navigator.gpu.requestAdapter();
  if (!context.adapter) {
    throw new Error("can not get adapter.");
  }
  context.device = await context.adapter.requestDevice();

  context.device.lost.then((info) => {
    console.error(info.message);
    if (info.reason !== "destroyed") {
      initGpu(context);
    }
  });

  return;
}
export function initCanvas(canvas: HTMLCanvasElement, device: GPUDevice) {
    const canvasContext = canvas.getContext("webgpu");
    if(!canvasContext){
      throw new Error()
    }
    canvasContext.configure({
      format: navigator.gpu.getPreferredCanvasFormat(),
      device: device,
    });
}

export function assertContext(context: DeviceContext) {
  if (context.adapter && context.device) {
    return { adapter: context.adapter, device: context.device };
  }
  throw new Error();
}
