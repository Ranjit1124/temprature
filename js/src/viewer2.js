import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import TWEEN from "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import * as BufferGeometryUtils from "https://unpkg.com/three@0.155.0/examples/jsm/utils/BufferGeometryUtils.js";


let completeViewer = null;

function create() {
  completeViewer = new Viewer();
  completeViewer.createViewer();

  const temprature = document.getElementById('mergeButton');
  temprature.addEventListener('click', () => {
    completeViewer.applySmokeToRoom();
  });

  const remove = document.getElementById('remove');
  remove.addEventListener('click', () => {
    completeViewer.remove();
  });
}

class Viewer {
  constructor() {
    this.camera = null;
    this.controls = null;
    this.container = null;
    this.scene = null;
    this.renderer = null;
    this.widthO = 1250;
    this.heightO = 880;
    this.gltf_loader = new GLTFLoader();
    this.model = null;
    this.clock = new THREE.Clock();
    this.roomMeshes = [];
    this.boxMeshes = []; // Store created box meshes
    this.composer = null; // Initialize composer
    this.bloomPass = null; // Initialize bloom pass
    this.merging=[]
  }

  createViewer() {
    this.initScene();
    this.animate();
  }

  initScene() {
    this.container = document.getElementById("canvas") || document.createElement("div");
    document.body.appendChild(this.container);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.widthO, this.heightO);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor("white");
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#8CBED6');

    this.camera = new THREE.PerspectiveCamera(45, this.widthO / this.heightO, 0.1, 1000);
    this.camera.position.set(10, 0, 10);
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);
    this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 10);
    this.directionalLight1.position.set(3, 5, -3);
    this.scene.add(this.directionalLight1);

    // const helper = new THREE.DirectionalLightHelper( directionalLight1, 4 );
// this.scene.add( helper );

    this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 10);
    this.directionalLight2.position.set(-3, 5, 3);
    this.scene.add(this.directionalLight2);
//     const helper2 = new THREE.DirectionalLightHelper( this.directionalLight2, 4 );
// this.scene.add( helper2 );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.gltf_loader.load("/floor 3 with temp/floor 3.glb", (glb) => {
      this.model = glb.scene;
      this.scene.add(this.model);
      this.gltfbox = new THREE.Box3().setFromObject(this.model);
      this.gltfBoxCenter = this.gltfbox.getCenter(new THREE.Vector3());
console.log('boxCenter',this.gltfBoxCenter);

const helper = new THREE.Box3Helper( this.gltfbox, 'green' );
this.scene.add( helper );

      this.setupComposer(); // Setup composer after loading
    });
  }

  setupComposer() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.widthO, this.heightO),
      0.3,  // Bloom strength
      0.8,  // Bloom radius
      0.65     );
    this.bloomPass.renderToScreen = true; // Set to render to screen
    this.composer.addPass(this.bloomPass); // Add bloom pass to composer
  }

  applySmokeToRoom() {

    this.roomMeshes = this.extractRoomMeshes(this.model);
    this.roomMeshes.forEach((roomMesh) => {
      const box = new THREE.Box3().setFromObject(roomMesh);
      const boxSize = box.getSize(new THREE.Vector3());
      const boxCenter = box.getCenter(new THREE.Vector3());
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({ color:'white', transparent: true, opacity: 0.5, emissive: 'white', emissiveIntensity: 4 });
      const boxMesh = new THREE.Mesh(geometry, material);
      this.scene.add(boxMesh); // Add boxMesh to the main scene
      this.boxMeshes.push(boxMesh); // Store reference to box mesh

      console.log(roomMesh.id);
      // Set position and colors based on roomMesh id
      if (roomMesh.id == 98 || roomMesh.id == 99 || roomMesh.id == 100) {
        boxMesh.material.color.set('#27ccf5')
        boxMesh.material.emissive.set('#27ccf5')
        boxMesh.position.set(boxCenter.x, boxCenter.y, box.min.z);
        console.log('ok',boxMesh);

        
      } else if (roomMesh.id == 96) {
        boxMesh.position.set(box.max.x, boxCenter.y, boxCenter.z);

        boxMesh.material.color.set('#baeb34')
        boxMesh.material.emissive.set('#baeb34')
        
      
      } else if (roomMesh.id == 97) {
        
        boxMesh.material.color.set('#baeb34')
        boxMesh.material.emissive.set('#baeb34')
        
        boxMesh.position.set(box.max.x, boxCenter.y, boxCenter.z);
      } else {
        boxMesh.material.color.set('#f55027')
        boxMesh.material.emissive.set('#f55027')

        boxMesh.position.set(boxCenter.x, boxCenter.y, box.max.z);
      }
//       const col=['red','yellow','#0cf752']
//       const randomElement = Math.floor(Math.random() * col.length);
// boxMesh.material.color.set(col[randomElement])
// boxMesh.material.emissive.set(col[randomElement])

      boxMesh.scale.set(0, 0, 0); // Initial scale
      const scaleX = boxSize.x;
      const scaleZ = boxSize.z;

      // Tween animations for scale and position
      if( roomMesh.id==102  ||  roomMesh.id==103  ){
        new TWEEN.Tween(boxMesh.position)
        .to({ x: boxCenter.x, y: boxCenter.y+0.1, z: boxCenter.z }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();

        new TWEEN.Tween(boxMesh.scale)
        .to({ x: scaleX, y: 0.1, z: scaleZ }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();


      }
      else if( roomMesh.id==98 || roomMesh.id==99){
        new TWEEN.Tween(boxMesh.position)
        .to({ x: boxCenter.x, y: boxCenter.y+0.1, z: boxCenter.z }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();

        new TWEEN.Tween(boxMesh.scale)
        .to({ x: scaleX, y: 0.1, z: scaleZ }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();

      }
      else{
        new TWEEN.Tween(boxMesh.scale)
        .to({ x: scaleX, y: 0.1, z: scaleZ }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
        new TWEEN.Tween(boxMesh.position)
        .to({ x: boxCenter.x, y: boxCenter.y+0.1, z: boxCenter.z }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();

      }

      
      this.merging.push(boxMesh)


    });
    this.directionalLight1.intensity=3
    this.directionalLight2.intensity=3
    console.log(this.merging);
    
//     const geometries = [this.merging[0].geometry, 
//     this.merging[1].geometry,
//     this.merging[2].geometry,
//     this.merging[3].geometry,
//     this.merging[4].geometry,
//     this.merging[5].geometry,
//     this.merging[6].geometry,
//     this.merging[7].geometry
//   ].filter(geo => geo !== null && geo !== undefined);

//     if (geometries.length === 0) {
//         console.error("No valid geometries found for merging.");
//     } else {

//     const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
//     const mergedmaterial = new THREE.MeshStandardMaterial({
//           color:'white',
//           emissive:'white',
//           emissiveIntensity:3,
//           transparent:true,
//           opacity:0.1
//     });
//     const mergedMesh = new THREE.Mesh(mergedGeometry,mergedmaterial);
//     mergedMesh.position.set(0,1,0)
//     mergedMesh.scale.set(5,0.1,3)
//     this.scene.add(mergedMesh);

//     new TWEEN.Tween(mergedMesh.position)
//     .to({x:this.gltfBoxCenter.x,y:this.gltfBoxCenter.y-0.2,z:this.gltfBoxCenter.z},3000)
//     .easing(TWEEN.Easing.Linear.None)
//     .start();

// console.log(mergedMesh);
// const box = new THREE.Box3().setFromObject(mergedMesh);
// const helper = new THREE.Box3Helper( box, 0xffff00 );
// this.scene.add( helper );

//   }
  // const geometry = new THREE.PlaneGeometry( 1, 1 );
  // const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  // const plane = new THREE.Mesh( geometry, material );
  //   plane.position.set(0,1,0)
  //   plane.scale.set(5,3)
  //   plane.rotation.x=Math.PI/2
  //   this.scene.add(plane);

  //   new TWEEN.Tween(plane.position)
  //   .to({x:this.gltfBoxCenter.x,y:this.gltfBoxCenter.y-0.2,z:this.gltfBoxCenter.z},3000)
  //   .easing(TWEEN.Easing.Linear.None)
  //   .start();

  // this.scene.add( plane );
  }
  extractRoomMeshes(model) {
    const roomMeshes = [];
    model.traverse((child) => {
      if (child.isMesh && /^Floor\d+_Room\d+$/.test(child.name)) {
        roomMeshes.push(child);
      }
    });
    return roomMeshes;
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
    this.render();
  }

  render() {
    if (!this.composer) return;

    this.renderer.render(this.scene, this.camera);
    
    this.renderer.clearDepth();
    
    if (this.boxMeshes.length > 0 ) {
      this.composer.render(); // Render with bloom effect applied
    }
  }

  remove() {
    // Clear existing box meshes from the scene
    this.boxMeshes.forEach(boxMesh => {
      this.scene.remove(boxMesh); // Remove box mesh from scene
    });
    this.boxMeshes = []; // Clear array
    this.directionalLight1.intensity=10
    this.directionalLight2.intensity=10

  }
}

export { completeViewer, create };
