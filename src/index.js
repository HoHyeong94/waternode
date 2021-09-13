import {
  LiteGraph,
  GLTFLoader,
  KTX2Loader,
  DRACOLoader,
  MeshoptDecoder,
  axios,
  sceneAdder,
  THREE,
  Sky,
  Water,
  SetXRenv,
  THREELINE
} from "global";
import { LineSegMesh, LabelInsert } from "./lineUtils";


export let koreanFont = null

var gloader = new THREE.FontLoader()

export default new Promise((r, j) => gloader.load('/fonts/korean.json', function (font) {
        koreanFont = font;
        console.log("loaded");
        r()
}))
function WsData() {
  this.addInput("댐코드", 0);
  this.addInput("조회시작일", 0);
  this.addInput("조회종료일", 0);
  this.addInput("줄수", 0);
  this.addInput("페이지번호", 0);
  this.addInput("조회시작시간", 0);
  this.addInput("조회종료시간", 0);
  // this.addOutput("일시", 0);
  // this.addOutput("댐수위", 0);
  // this.addOutput("강우량", 0);
  // this.addOutput("유입량", 0);
  // this.addOutput("총방류량", 0);
  // this.addOutput("저수량", 0);
  // this.addOutput("저수율", 0);
  this.addOutput("WsData", 0);
}

WsData.prototype.onExecute = async function () {
  const serviceKey =
    "ejdrD89pyah0JlAaICprH0xOAEp0tAxvExhm2p0DT5Ulq2MskjlekFH7kFIAEt6d16gjJ2scGwRSLG4Rr1HUiA==";
  const baseURL =
    "https://booster-app.account7172.workers.dev/openapi-data/service/pubd/dam/sluicePresentCondition/mnt/list";
  const damcode = this.getInputData(0) ?? "1012110";
  const stdt = this.getInputData(1) ?? "2020-09-02";
  const eddt = this.getInputData(2) ?? "2020-09-02";
  const numOfRows = this.getInputData(3) ?? "144";
  const pageNo = this.getInputData(4) ?? "undefined";
  const stct = this.getInputData(5) ?? 0;
  const edct = this.getInputData(6) ?? 24;

  // const stctIndex = stct * 6;
  // const edctIndex = edct * 6;

  let wsData = {
    obsrdtmnt: [],
    lowlevel: [],
    rf: [],
    inflowqy: [],
    totdcwtrqy: [],
    rsvwtqy: [],
    rsvwtrt: [],
  }

  let queryParams = "?";
  queryParams +=
    encodeURIComponent("damcode") + "=" + encodeURIComponent(damcode); /**/
  queryParams +=
    "&" + encodeURIComponent("stdt") + "=" + encodeURIComponent(stdt); /**/
  queryParams +=
    "&" + encodeURIComponent("eddt") + "=" + encodeURIComponent(eddt); /**/
  queryParams +=
    "&" +
    encodeURIComponent("numOfRows") +
    "=" +
    encodeURIComponent(numOfRows); /**/
  queryParams +=
    "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent(pageNo); /**/
  queryParams +=
    "&" + encodeURIComponent("ServiceKey") + "=" + serviceKey; /*Service Key*/

  let response = await axios(baseURL + queryParams, {
    method: "GET",
  });

  let items = response.data.response.body.items.item;


  if (stct > edct || stct < 0 || edct > 24) {
    for (let i in items) {
      wsData.inflowqy.push(items[i].inflowqy)
      wsData.lowlevel.push(items[i].lowlevel)
      wsData.obsrdtmnt.push(items[i].obsrdtmnt)
      wsData.rf.push(items[i].rf)
      wsData.rsvwtqy.push(items[i].rsvwtqy)
      wsData.rsvwtrt.push(items[i].rsvwtrt)
      wsData.totdcwtrqy.push(items[i].totdcwtrqy)
    }

  } else {
    for (let i = stct * 6; i < edct * 6 ; i++) {
      if (!(items[i])) continue;
      wsData.inflowqy.push(items[i].inflowqy)
      wsData.lowlevel.push(items[i].lowlevel)
      wsData.obsrdtmnt.push(items[i].obsrdtmnt)
      wsData.rf.push(items[i].rf)
      wsData.rsvwtqy.push(items[i].rsvwtqy)
      wsData.rsvwtrt.push(items[i].rsvwtrt)
      wsData.totdcwtrqy.push(items[i].totdcwtrqy)
    }
  }

  // console.log("-----data-----");
  // console.log(data)
  console.log(wsData);
  this.setOutputData(0, wsData);
};

WsData.title = "WsData";

LiteGraph.registerNodeType("test/WsData", WsData);

function GLTFLoaderNode() {
  this.addInput("path", 0);
  this.addOutput("model", 0);
}

const loader = new GLTFLoader()
  .setDRACOLoader(new DRACOLoader().setDecoderPath("../../assets/wasm/"))
  .setKTX2Loader(new KTX2Loader().setTranscoderPath("../../assets/wasm/"))
  .setMeshoptDecoder(MeshoptDecoder);

GLTFLoaderNode.prototype.onExecute = async function () {
  let url = this.getInputData(0);

  let scene2 = await new Promise((resolve) => {
    loader.load(url, (gltf) => {
      let scene = gltf.scene || gltf.scenes[0];
      if (!scene) {
        throw new Error(
          "This model contains no scene, and cannot be viewed here. However," +
            " it may contain individual 3D resources."
        );
      }
      resolve(scene);
    });
  });
  scene2.scale.multiplyScalar(100000);
  scene2.position.set(50, -650, -600);
  this.setOutputData(0, scene2);
};

GLTFLoaderNode.title = "GLTFLoaderNode";

// Expose Node
LiteGraph.registerNodeType("test/GLTFLoaderNode", GLTFLoaderNode);

function LightNode() {
  // this.addInput("input", "*");
  this.addOutput("Light", 0);
}

LightNode.title = "LightNode";

LightNode.prototype.onExecute = function () {
  const group = new THREE.Group();
  const light = new THREE.AmbientLight(0x404040, 0.2); // soft white light
  const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);

  group.add(light);
  group.add(hemiLight);

  this.setOutputData(0, group);
};


// Expose Node
LiteGraph.registerNodeType("test/LightNode", LightNode);

function SunNode() {
  this.addInput("elevation", 0);
  this.addInput("azimuth", 0);
  this.addOutput("sun", 0);
}

SunNode.title = "SunNode"

SunNode.prototype.onExecute = function () {
  let elevation = this.getInputData(0) ?? 2;
  let azimuth = this.getInputData(1) ?? 180;

  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);

  let sun = new THREE.Vector3();
  
  sun.setFromSphericalCoords(1, phi, theta);
  this.setOutputData(0, sun);
}

LiteGraph.registerNodeType("test/SunNode", SunNode);


function SkyNode() {
  this.addInput("turbidity", 0);
  this.addInput("rayleigh", 0);
  this.addInput("mieCoefficient", 0);
  this.addInput("mieDirectionalG", 0);
  this.addOutput("Sky", 0);
}

SkyNode.title = "SkyNode";

SkyNode.prototype.onExecute = function () {
  let turbidity = this.getInputData(0) ?? 10;
  let rayleigh = this.getInputData(1) ?? 2;
  let mieCoefficient = this.getInputData(2) ?? 0.005;
  let mieDirectionalG = this.getInputData(3) ?? 0.8;

  const sky = new Sky();
  sky.scale.setScalar(10000);

  const skyUniforms = sky.material.uniforms;
  skyUniforms['turbidity'].value = turbidity;
  skyUniforms['rayleigh'].value = rayleigh;
  skyUniforms['mieCoefficient'].value = mieCoefficient;
  skyUniforms['mieDirectionalG'].value = mieDirectionalG;


  this.setOutputData(0, sky);
}

LiteGraph.registerNodeType("test/SkyNode", SkyNode);

function WaterNode() {
  this.addInput("level", 0);
  this.addInput("material", 0);
  this.addOutput("water", 0);
}

WaterNode.title = "WaterNode";

WaterNode.prototype.onExecute = function () {
  let level = this.getInputData(0) ?? 0;
  let waterBodyMat = this.getInputData(1) ?? defaultwaterBodyMat
  let waterGroup = new THREE.Group();
  const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
  const waterBodyGeo = new THREE.BoxGeometry(1000, 100, 1000);

  let water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('../../textures/waternormals.jpg', function (texture) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      }),
      // sunDirection: new THREE.Vector3(),
      sunDirection: new THREE.Vector3(100, 100, 100),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: undefined
    }
  );

  water.rotation.x = - Math.PI / 2;
  const defaultwaterBodyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.62, color: 0x001e0f, side: THREE.DoubleSide })
  let waterBody = new THREE.Mesh(waterBodyGeo, waterBodyMat)

  waterBody.position.y = -50.01

  // scene.add(waterBody)
  // scene.add( water );

  waterGroup.add(waterBody);
  waterGroup.add(water);

  waterGroup.position.y += level;
  this.setOutputData(0, waterGroup);
}

LiteGraph.registerNodeType("test/WaterNode", WaterNode);
function SetEnvironment () {
  this.addInput("Sun", 0);
  this.addInput("Sky", 0);
  this.addInput("Water", 0);
}

SetEnvironment.title = "SetEnvironment"

SetEnvironment.prototype.onExecute = function () {
  let sun = this.getInputData(0);
  let sky = this.getInputData(1);
  let water = this.getInputData(2);
  SetXRenv({sky, sun, water});
}

LiteGraph.registerNodeType("test/SetEnvironment", SetEnvironment);

const targetData = {
  lowlevel: "댐수위",
  rf: "강우량",
  inflowqy: "유입량",
  totdcwtrqy: "총방류량",
  rsvwtqy: "저수량",
  rsvwtrt: "저수율"
}
function WsGraphView() {
  this.addInput("WsData", 0);
  this.addInput("Target", 0);
  this.addInput("material", 0);
  this.addInput("TextMaterial", 0);
  this.addOutput("Graph", 0);
}

WsGraphView.title = "WsGraphView";

WsGraphView.prototype.onExecute = function () {
  let data = this.getInputData(0);
  let target = this.getInputData(1) ?? "totdcwtrqy"
  let material = this.getInputData(2) ?? undefined;
  let textMat = this.getInputData(3) ?? undefined;
  let graphSet = new THREE.Group();
  let xAxios = [];
  let yAxios = [];
  let pts = [];
  let textList = [];
 
  let yData = data[target];
  let re = new RegExp(/,/g)

  for (let i in yData) {
    if(!(typeof yData[i] === "string")) continue;
    yData[i] = parseFloat(yData[i].replace(re, ''));
  }

  let yMax = Math.max.apply(null, yData)
  let yMin = Math.min.apply(null, yData)
  let scale = 1000;
  // let init = {x:0, y:0, z:0}
  // const xAxiosLength = data.obsrdtmnt.length;
  const xAxiosLength = 144;
  let yCali = xAxiosLength / (yMax - yMin)
  let _lineSeg = [];
  let _lineXaxios = [];
  let _lineYaxios = [];
  let _xMarkLine = [];
  let _yMarkLine = [];

  yAxios.push(...[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, (((yMax - yMin) * yCali)) * scale, 0)]);
  xAxios.push(...[new THREE.Vector3(0, 0, 0), new THREE.Vector3((xAxiosLength) * scale, 0, 0)]);

  let backgroudMeshPos = [(xAxiosLength * scale) / 2, ((yMax - yMin) * yCali * scale) / 2, 0];

  for(let i = 0; i < xAxiosLength + 1; i++) {
    pts.push(new THREE.Vector3(i * scale, (((yData[Math.round((data.obsrdtmnt.length / xAxiosLength) * i)] - yMin) * yCali)) * scale, 0));
  }

  
  pts.reduce((re, cu) => {
    _lineSeg.push(re, cu);
    return cu;
  });
  yAxios.reduce((re, cu) => {
    _lineYaxios.push(re, cu);
    return cu;
  });
  xAxios.reduce((re, cu) => {
    _lineXaxios.push(re, cu);
    return cu;
  });
  
  
  let _result = LineSegMesh(_lineSeg, material);
  let _resultX = LineSegMesh(_lineXaxios, material);
  let _resultY = LineSegMesh(_lineYaxios, material);

  for (let i = 0; i <= 6; i++) {
    let xMarkLine = [];
    let yMarkLine = [];
    let Ytext = (yMin + ((yMax - yMin) / 6) * i).toFixed(2);
    let Yanchor = [-(scale / 200) * scale, (((yMax - yMin) * yCali) / 6) * i * scale, 0]; 
    textList.push({
        text: Ytext.toString(),
        anchor: Yanchor,
        rotation: 0,
        fontSize: scale * 5,
        align: "right",
    })

    yMarkLine.push(new THREE.Vector3(0, ( (((yMax - yMin) * yCali) / 6) * i ) * scale, 0), new THREE.Vector3(-(scale/200) * scale, ((((yMax - yMin) * yCali) / 6) * i) * scale, 0) )
    yMarkLine.reduce((re, cu, idx) => {
      _yMarkLine.push(re, cu);
      return cu;
    });

    let _resultYmark = LineSegMesh(_yMarkLine, material);
    graphSet.add(_resultYmark);

    if (!(i === 0)) {
      let Xtext = data.obsrdtmnt[Math.round((data.obsrdtmnt.length / 6)) * i - 1].slice(6)
      let Xanchor = [(xAxiosLength / 6 * i) * scale, -(scale/200) * scale, 0]
      xMarkLine.push(new THREE.Vector3((xAxiosLength / 6 * i) * scale, 0, 0), new THREE.Vector3((xAxiosLength / 6 * i) * scale, - (scale/200) * scale, 0))
      xMarkLine.reduce((re, cu, idx) => {
        _xMarkLine.push(re, cu);
        return cu;
      });
      let _resultXmark = LineSegMesh(_xMarkLine, material);
      graphSet.add(_resultXmark);
      textList.push({
        text: Xtext,
        anchor: Xanchor,
        rotation: 0,
        fontSize: scale * 3,
        align: "center",
      })
    }
  }

  textList.push({
    text: `${data.obsrdtmnt[0].slice(0,5)} 댐 ${targetData[target]}`,
    anchor: [(-(scale/200)) * scale, (((yMax - yMin) * yCali) + 30) * scale, 0],
    rotation: 0,
    fontSize: scale * 8,
    align: "left",
  })

  const backgroundMat = new THREE.MeshLambertMaterial({
    color:0xffffff,
    transparent: true,
    opacity: 0.7,
    roughness:0.8,
    metalness:1,
    side: THREE.DoubleSide
    });
  let backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(200 * scale, 225 * scale), backgroundMat);
  backgroundMesh.position.set(backgroudMeshPos[0], backgroudMeshPos[1], backgroudMeshPos[2] - 100);

  graphSet.add(LabelInsert(textList, textMat));
  graphSet.add(_result)
  graphSet.add(_resultX)
  graphSet.add(_resultY);
  graphSet.add(backgroundMesh)

  graphSet.userData = {
    key: targetData[target],
    part: "수자원공사",
    name: "graph"
  }

  graphSet.name = "graph"

  this.setOutputData(0, graphSet)
}

LiteGraph.registerNodeType("test/WsGraphView", WsGraphView);

function setWorldGraph() {
  this.addInput("Graph", 0);
  this.addInput("position", 0);
  this.addInput("scale", 0);
  this.addOutput("Graph", 0);
}

setWorldGraph.title = "setWorldGraph";

setWorldGraph.prototype.onExecute = function () {
  let graph = this.getInputData(0) ?? null;
  let position = this.getInputData(1) ?? {x:0, y:0, z:0};
  let scale = this.getInputData(2) ?? 1;

  graph.scale.set(scale, scale, scale)
  graph.position.set(position.x, position.y, position.z)
  // graph.lookAt(0,0,0)
  
  this.setOutputData(0, graph);
}

LiteGraph.registerNodeType("test/setWorldGraph", setWorldGraph);
