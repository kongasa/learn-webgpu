import { Camera } from "./camera";
import { DVec, multi } from "./vec";

const angV = 1 / 1000000;
const targetV = 1 / 1000000;
const rightV = 1 / 1000000;
const upV = 1 / 1000000;

enum AllowedKeyCodes {
  KeyW = "KeyW",
  KeyA = "KeyA",
  KeyS = "KeyS",
  KeyD = "KeyD",
  KeyC = "KeyC",
  Space = "Space",
  KeyQ = "KeyQ",
  KeyE = "KeyE",
}
const allowedKeyCodes = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyC",
  "Space",
  "KeyQ",
  "KeyE",
];
export const KeyBit: { [key in AllowedKeyCodes]: boolean } = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  KeyC: false,
  Space: false,
  KeyQ: false,
  KeyE: false,
};
export let keyboardOn = false;

function keyboardDown(e: KeyboardEvent) {
  if (allowedKeyCodes.includes(e.code)) {
    KeyBit[e.code as AllowedKeyCodes] = true;
  }
}
function keyboardUp(e: KeyboardEvent) {
  if (allowedKeyCodes.includes(e.code)) {
    KeyBit[e.code as AllowedKeyCodes] = false;
  }
}

export function registerKeyboard() {
  if (!keyboardOn) {
    globalThis.addEventListener("keydown", keyboardDown);
    globalThis.addEventListener("keyup", keyboardUp);
    keyboardOn = true;
  }

  return () => {
    globalThis.removeEventListener("keydown", keyboardDown);
    globalThis.removeEventListener("keyup", keyboardUp);
    keyboardOn = false;
  };
}

export class FpsCamera extends Camera {
  constructor() {
    super();
  }
  update(dt: number) {
    if (KeyBit["KeyW"] !== KeyBit["KeyS"]) {
      if (KeyBit["KeyW"]) {
        this.positionByVec(multi(this.target, targetV * dt) as DVec);
      } else {
        this.positionByVec(multi(this.target, -targetV * dt) as DVec);
      }
    }
    if (KeyBit["KeyA"] !== KeyBit["KeyD"]) {
      if (KeyBit["KeyA"]) {
        this.positionByVec(multi(this.right, -rightV * dt) as DVec);
      } else {
        this.positionByVec(multi(this.right, rightV * dt) as DVec);
      }
    }
    if (KeyBit["Space"] !== KeyBit["KeyC"]) {
      if (KeyBit["Space"]) {
        this.positionByVec(multi(this.worldUp, upV * dt) as DVec);
      } else {
        this.positionByVec(multi(this.worldUp, -upV * dt) as DVec);
      }
    }
    if (KeyBit["KeyQ"] !== KeyBit["KeyE"]) {
      if (KeyBit["KeyQ"]) {
        this.pitchRad(angV * dt);
      } else {
        this.pitchRad(-angV * dt);
      }
    }
  }
  pitchRad(rad: number) {
    const [x, y, z] = this.target;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.lookAtVec([c * x + s * z, y, -s * x + c * z, 0]);
  }
}
