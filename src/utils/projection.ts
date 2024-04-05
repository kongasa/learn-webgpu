import { Matrix4 } from "@math.gl/core";

export function getProjection() {
  return new Matrix4().perspective({
    fovy:0.75,
    aspect:1,
    near:0.1,
    far:100
  })
}