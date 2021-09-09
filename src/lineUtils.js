import { THREE, BufferGeometryUtils } from "global"
import { koreanFont } from "./index"

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

export function LabelInsert(label, textMaterial) {
    let index = 0;
    console.time("textLoader")
    let group = new THREE.Group()
    // var loader = new THREE.FontLoader();
    let mGeos = [];
    // loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
    // gloader.load('/fonts/korean.json', function (font) {
    // loader.load('/fonts/korean.json', function (font) {
    console.log("loadercheck")
    // loader.load('fonts/noto_sans_kr_regular.json', function (font) {
    // console.log(font)roundedRect
    // var font = {generateShapes:(messagem , num)=>{}}
    for (let i in label) {
        var shapes = koreanFont.generateShapes(label[i].text, label[i].fontSize);
        var geometry = new THREE.ShapeBufferGeometry(shapes);
        if (label[i].align === "left") {
            geometry.translate(0, -label[i].fontSize / 2, 0);
        } else if (label[i].align === "right") {
            var xMid
            geometry.computeBoundingBox();
            xMid = -1 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            geometry.translate(xMid, -label[i].fontSize / 2, 0);
        }
        else {
            var xMid
            geometry.computeBoundingBox();
            xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            geometry.translate(xMid, -label[i].fontSize / 2, 0);
        }

        if (label[i].rotation) {
            geometry.rotateZ(label[i].rotation)
        }
        geometry.translate(label[i].anchor[0], label[i].anchor[1], 0);
        mGeos.push(geometry)
        // make shape ( N.B. edge view not visible )
        // let textMesh = new THREE.Mesh(geometry, textMaterial);
        // textMesh.layers.set(layer)
        // group.add(textMesh);
    }

    if (mGeos.length > 0) {
        let textMesh = new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(mGeos), textMaterial);
        // textMesh.layers.set(layer)
        group.add(textMesh);
    }
    console.timeEnd("textLoader")
    index = 1;

    // });
    return group// text.position.z = 0;
}