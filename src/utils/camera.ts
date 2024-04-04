type dVec = [number, number, number, 0];

function norm([x, y, z]: dVec): dVec {
  const l = Math.sqrt(x * x + y * y + z * z);
  console.log(l);
  return [x / l, y / l, z / l, 0];
}
function cross(a: dVec, b: dVec): dVec {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
    0,
  ];
}

export class Camera {
  public x: number;
  public y: number;
  public z: number;
  public worldUp: dVec = [0, 1, 0, 0];
  public up: dVec = [0, 1, 0, 0];
  public right: dVec = [1, 0, 0, 0];
  public target: dVec = [0, 0, -1, 0];
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
  position(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  positionByVec(x: number, y: number, z: number) {
    this.x += x;
    this.y += y;
    this.z += z;
  }
  lookAt(x: number, y: number, z: number) {
    this.target = norm([x, y, z, 0]);
    this.right = norm(cross(this.target, this.worldUp));
    this.up = norm(cross(this.right, this.target));
  }
  lookAtPoint(x: number, y: number, z: number) {
    this.lookAt(x - this.x, y - this.y, z - this.z);
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
