class ShaderSetter {
  public device: GPUDevice|undefined;
  public label: string|undefined;
  public code: string;
  public shaderModule: GPUShaderModule|undefined;
  public state: 'ready'|'success'|'lost';
  constructor(device:GPUDevice, code: string, label?: string) {
    this.label = label;
    this.code = code;
    this.device = device;
    this.state = 'ready';
    this.shaderModule = undefined;
    device.lost.then(info => {
      console.error(`device lost for this shader, message: ${info.message}, reason: ${info.reason}`)
      this.device = undefined;
      this.shaderModule=undefined;
      this.state = 'lost';
    })
  }
  make() {
    if(!(this.state === 'ready') || !this.device){
      return;
    }
    this.shaderModule = this.device.createShaderModule({
      label: this.label,
      code: this.code
    });
    this.state = 'success'
  }
  getShaderModule(){
    if(this.state!=='success'||!this.device||!this.shaderModule){
      return undefined;
    }
    return this.shaderModule;
  }
}

class SimpleShaderLinkHelper {

}

class SimpleShaderWrap {
  
}