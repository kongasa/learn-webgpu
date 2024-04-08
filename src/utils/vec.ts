export type DVec = [number, number, number, 0];
export type PVec = [number, number, number, 1];
export type CVec = DVec | PVec;
export type Vec = [number, number, number, number];

export function norm([x, y, z]: DVec): DVec {
  const l = Math.sqrt(x * x + y * y + z * z);
  return [x / l, y / l, z / l, 0];
}
export function cross(a: DVec, b: DVec): DVec {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
    0,
  ];
}
export function multi(v: Vec, s: number): Vec {
  return [v[0] * s, v[1] * s, v[2] * s, v[3] * s];
}
export function neg([x, y, z]: DVec): DVec {
  return [-x, -y, -z, 0];
}