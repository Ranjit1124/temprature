import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import TWEEN from "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js";
//https://codepen.io/teolitto/pen/KwOVvL
import * as BufferGeometryUtils from "https://unpkg.com/three@0.155.0/examples/jsm/utils/BufferGeometryUtils.js";
var completeViewer = null;

function create() {
  completeViewer = new Viewer();
  createUi();
  completeViewer.createViewer();
}

function createUi() {
  let para = document.createElement("div");

  document.body.appendChild(para);
}

class Viewer {
  constructor() {
    this.camera = null;
    this.controls = null;
    this.container = null;
    this.scene = null;
    this.lights = null;
    this.renderer = null;
    this.mouse = null;
    this.widthO = 1250;
    this.heightO = 880;
    this.gltf_loader = new GLTFLoader();
    this.cube;
    this.model = null;
  }

  createViewer() {
    completeViewer.initial();
    completeViewer.animate();
  }

  initial() {
    //container
    this.container = document.getElementById("canvas");
    document.body.appendChild(this.container);

    //renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.widthO, this.heightO);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor("white");
    this.container.appendChild(this.renderer.domElement);

    //scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb3e5fc); // Scene background color
    this.scene.fog = new THREE.Fog("grey", 0.0015);

    //camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.widthO / this.heightO,
      0.1,
      1000
    );
    this.camera.position.set(10, 0, 10);
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);
    this.mouse = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.lights = new THREE.AmbientLight(0xffffff, 10);
    this.scene.add(this.lights);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    let diractionHel = new THREE.DirectionalLightHelper(directionalLight);
    directionalLight.position.set(-3, 2, 3);
    directionalLight.castShadow=false
    this.scene.add(diractionHel);
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 10);
    let diractionHel2 = new THREE.DirectionalLightHelper(directionalLight2);
    directionalLight2.position.set(3, 2, -3);
    directionalLight2.castShadow=false

    this.scene.add(diractionHel2);
    this.scene.add(directionalLight2);

    this.gltf_loader.load("/floor 3 with temp/floor 3.glb", (glb) => {
      this.model = glb.scene;
      this.scene.add(this.model);
      let room1;
      room1 = this.model.children[0];

      this.applyColorFrom8thMesh(room1);
    });
  }

  applyColorFrom8thMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
      

    // Create a MeshPhongMaterial and enable vertex colors
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,  // Use vertex colors
      shininess: 100,      // Add some shininess
      specular: 0x555555   // Slight specular reflection
    });
    const cube1 = new THREE.Mesh(geometry, material);
    this.scene.add(cube1);
    const geometry2 = new THREE.BoxGeometry(1, 1, 1);
    const material2 = new THREE.MeshBasicMaterial();
    const cube2 = new THREE.Mesh(geometry2, material2);
    cube2.position.x = 3;
    this.scene.add(cube2);

    // Extract the geometries from the meshes
    const geometries = [cube1.geometry, cube2.geometry].filter(geo => geo !== null && geo !== undefined);

    if (geometries.length === 0) {
        console.error("No valid geometries found for merging.");
    } else {
        // Merge the geometries
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
    
        // Create a new mesh with the merged geometry
        const materialqq = new THREE.MeshPhongMaterial({
          transparent:true,
          opacity:0.1,
          color:'yellow'

        });
    
        const mergedMesh = new THREE.Mesh(mergedGeometry,materialqq);
        const box = new THREE.Box3().setFromObject(mergedMesh);
const helper = new THREE.Box3Helper( box, 0xffff00 );

        this.scene.add(mergedMesh,helper);
    }
    // geometries[0].boundingSphere.radius
    // for(let i=0;i<=geometries[0].attributes.normal.array.length;i++){
    //   // const j=Math.random()*6
    //   console.log(      geometries[0].attributes.normal.array[i] 
    //   );
      
    // }
    
}
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    TWEEN.update();
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export { completeViewer, create };





 


