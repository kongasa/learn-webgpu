import { DVec, PVec, cross, norm } from "./vec";

export class Camera {
  public x: number;
  public y: number;
  public z: number;
  public worldUp: DVec = [0, 1, 0, 0];
  public up: DVec = [0, 1, 0, 0];
  public right: DVec = [1, 0, 0, 0];
  public target: DVec = [0, 0, -1, 0];
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
  positionVec([x, y, z]: DVec) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  positionXyz(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  positionByVec([x, y, z]: DVec) {
    this.x += x;
    this.y += y;
    this.z += z;
  }
  positionByXyz(x: number, y: number, z: number) {
    this.x += x;
    this.y += y;
    this.z += z;
  }
  lookAtVec(v: DVec) {
    this.target = norm(v);
    this.right = norm(cross(this.target, this.worldUp));
    this.up = norm(cross(this.right, this.target));
  }
  lookAtXyz(x: number, y: number, z: number) {
    this.target = norm([x, y, z, 0]);
    this.right = norm(cross(this.target, this.worldUp));
    this.up = norm(cross(this.right, this.target));
  }
  lookAtPointVec([x, y, z]: PVec) {
    this.lookAtXyz(x - this.x, y - this.y, z - this.z);
  }
  lookAtPointXyz(x: number, y: number, z: number) {
    this.lookAtXyz(x - this.x, y - this.y, z - this.z);
  }
  mat() {
    const [ux, uy, uz] = this.up;
    const [rx, ry, rz] = this.right;
    const [px, py, pz] = [this.x, this.y, this.z];
    const [dx, dy, dz] = this.target;

    return [
      rx,
      ux,
      -dx,
      0,
      ry,
      uy,
      -dy,
      0,
      rz,
      uz,
      -dz,
      0,
      -rx * px - ry * py - rz * pz,
      -ux * px - uy * py - uz * pz,
      dx * px + dy * py + dz * pz,
      1,
    ];
  }
}
