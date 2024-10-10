import * as THREE from 'three'
import { completeViewer, create } from './viewer.js';


class Light {
    constructor() {

        this.selectedLight = null;
        this.offset = new THREE.Vector3();
        this.lightsObject = null;
        this.referencePlane = null;
        this.savedLights = {};
        this.boolAddLights = true;
        this.boolAddedFinishButton = true;
    }

    setLightsEnvironment() {
        this.light.referencePlane = this.addPlane();
        this.light.lightsObject = new THREE.Object3D();
        this.light.lightsObject.name = "Light";
    }

    addPlane() {
        const sceneBb = new THREE.Box3().setFromObject(this.sceneObject)
        const lengthX = sceneBb.max.x - sceneBb.min.x;
        const lengthY = sceneBb.max.y - sceneBb.min.y;
        const lengthZ = sceneBb.max.z - sceneBb.min.z;

        let max = lengthX;
        if (lengthY > max) max = lengthY;
        if (lengthZ > max) max = lengthZ;

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10 * max, 10 * max, 8, 8), new THREE.MeshBasicMaterial({ color: 0xb3e0ff, visible: false }));
        plane.name = "Light_plane";
        this.scene.add(plane);
        return plane;
    }

    scaleObject(boundingBox) {

        var xDimension = boundingBox.max.x - boundingBox.min.x;
        var yDimension = boundingBox.max.y - boundingBox.min.y;
        var zDimension = boundingBox.max.z - boundingBox.min.z;

        var maxOfXY = Math.max(xDimension, yDimension);
        var lengthOfLargestDimension = Math.max(maxOfXY, zDimension);
        var scaleFactor = 1 / lengthOfLargestDimension * 60;
        return scaleFactor;
    }

    getBoundingBoxLight(light) {
        let bbox = new THREE.Box3().setFromObject(this.sceneObject)
        let bboxMaxVal;
        if (bbox.max.x > bbox.max.y && bbox.max.x > bbox.max.z) {
            bboxMaxVal = bbox.max.x;
        }
        else if (bbox.max.y > bbox.max.z) {
            bboxMaxVal = bbox.max.y;
        }
        else {
            bboxMaxVal = bbox.max.z;
        }

        light.shadow.camera.left = - bboxMaxVal;
        light.shadow.camera.right = bboxMaxVal;
        light.shadow.camera.top = bboxMaxVal;
        light.shadow.camera.bottom = - bboxMaxVal;

        return light;
    }


    getSphere(scaleFactor, color) {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), new THREE.MeshBasicMaterial({ color: color }));
        sphere.position.set(0, 0, 0);
        sphere.scale.set(1 / scaleFactor, 1 / scaleFactor, 1 / scaleFactor);
        sphere.material.depthTest = false;
        sphere.renderOrder = 1;
        return sphere;
    }

    getBoundingBoxLength(boundingBox) {
        var v1 = boundingBox.max;
        var v2 = boundingBox.min;

        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;
        var length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return length;
    }
    /*
       * Calculates the scale factor between two objects
       */
    getScaleFactor(object1, object2) {
        var length1 = this.getBoundingBoxLength(new THREE.Box3().setFromObject(object1));
        var length2 = this.getBoundingBoxLength(new THREE.Box3().setFromObject(object2));
        return length1 / length2;
    }

}

export { Light }