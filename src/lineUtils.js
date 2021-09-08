import { THREE } from "global"

export function LineSegMesh(point0, lineMaterial, z) {
    let points = [];
    let z1 = z ? z : 0;
    for (let i in point0) {
        points.push(new THREE.Vector3(point0[i].x, point0[i].y, z1));
    }
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let result = new THREE.LineSegments(geometry, lineMaterial);
    result.computeLineDistances();
    return result;
}