var handFoundCount = 0;
var handLostCount = 0;
var dataEle = document.getElementById("data");
var statusEle = document.getElementById("status");

var hideNumbers = true;
var showPinchStrength = true;
var showGrabStrength = true;


var paused = false;

window.addEventListener("blur", function(e){
    paused = true;
    statusEle.innerHTML = "Paused translations";
});

window.addEventListener("focus", function(e){
    paused = false;

    statusEle.innerHTML = "Running translations";
});

var controllerOptions = {enableGestures:true};
Leap.loop(controllerOptions, function(frame){
    // reduces performance issues
    // leaving the page open in a browswer can slow the computer down. 
    if(!paused){
        translationSetup(frame);         
    }

}).on("handFound", function(frame){
    handFoundCount++;
    console.log(handFoundCount);
    paused = false;
    statusEle.innerHTML = "Running translations"; 

}).on("handLost", function(frame){
    handLostCount++;
    console.log(handLostCount);
    paused = true;

    displayToTranslationBox("No hands shown!");

    statusEle.innerHTML = "Paused translations";

}).use('riggedHand', {
    helper: true,
    dotsMode: true,
    opacity:1,
    offset: new THREE.Vector3(0,0,0),
    scale: 0.3,
    positionScale: 0.4,

    boneLabels: function(boneMesh, leapHand) {
        if(!showGrabStrength){
            if (boneMesh.name.indexOf('Finger_') === 0) {
                return leapHand.grabStrength;
            }
        }
    },
    boneColors: function(boneMesh, leapHand) {
      if ((boneMesh.name.indexOf('Finger_') === 0)) {
        return {
            hue: 0.564,
            saturation: leapHand.grabStrength,
            lightness: 0.5
        };
      }
    },
    checkWebGL: true
}).use('playback', {
    recording: 'js/demo.json.lz',
    requiredProtocolVersion: 6,
    pauseOnHand: true
});


/*---------------------------------------------------------
    Three JS
    Setting the Scene
---------------------------------------------------------*/
var scene    = Leap.loopController.plugins.riggedHand.scene;
var camera   = Leap.loopController.plugins.riggedHand.camera;
var renderer = Leap.loopController.plugins.riggedHand.renderer;

var plane = newPlane();

function newPlane(){
    return new THREE.Mesh(
        new THREE.PlaneGeometry(80,80),
            new THREE.MeshPhongMaterial({wireframe: false})
    );
}


plane.scale.set(2,2,2);
plane.position.set(0,200,-100);

camera.lookAt( plane.position );

//  scene.add(plane);

var axisHelper = new THREE.AxisHelper( 100 );
scene.add( axisHelper );


var controls = new THREE.OrbitControls( camera, renderer.domElement );


// Toggle Functions...

function toggleNumbers(){
    if(hideNumbers)
        document.getElementById("hideNumbers").innerHTML = "Disable Number Translation";

    else
        document.getElementById("hideNumbers").innerHTML = "Enable Number Translation";   
    
    hideNumbers = !hideNumbers;
}

function togglePinchStrength(){
    if(showPinchStrength)
        document.getElementById("togglePinchStrength").innerHTML = "Hide Pinch Strength";

    else
        document.getElementById("togglePinchStrength").innerHTML = "Show Pinch Strength";   
    showPinchStrength = !showPinchStrength;
}

function toggleGrabStrength(){
    if(showPinchStrength)
        document.getElementById("toggleGrabStrength").innerHTML = "Hide Grab Strength";

    else
        document.getElementById("toggleGrabStrength").innerHTML = "Show Grab Strength";   
    showGrabStrength = !showGrabStrength;    
}