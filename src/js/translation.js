var translationEle = document.getElementById("translation");

function displayToTranslationBox(translation){
    document.getElementById('translation-result').innerHTML = translation;
}


function translationSetup(frame){
	var fingerPositions = [];
	var fingerCount = 0;

	var fingerObject = null;
	var fingerType = null;
	var handType = null;

	var handGrabStrength = null;

	// Name of each finger and bones
	var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];
	var boneTypeMap = ["Metacarpal", "Proximal phalanx", "Intermediate phalanx", "Distal phalanx"];

	for(var h = 0; h < frame.hands.length; h++){
		if(frame.hands[h] !== undefined){
			handGrabStrength = frame.hands[h].grabStrength.toPrecision(2);

			// Loop through fingers
			for(var f = 0; f < frame.hands[h].fingers.length; f++){

				fingerObject = frame.hands[h].fingers[f];
				handType = frame.hands[h].type.toString();
				fingerType = fingerTypeMap[f];

				if(fingerObject.extended){
					fingerCount++;
				}

				fingerPositions[f] = convertFingerPositionsIntoXYZ(fingerObject.stabilizedTipPosition, handType, fingerType);

			}
		}
	}
	attemptTranslation(fingerPositions, fingerCount, handGrabStrength);
}

function convertFingerPositionsIntoXYZ(positions, hand, finger){
	var x = parseInt(positions[0]);
	var y = parseInt(positions[1]);
	var z = parseInt(positions[2]);

	return {
		hand, finger, x, y, z

		};
}

function attemptTranslation(fingerPositions, fingersExtended, handGrabStrength){
	var translationResult = "Could not translate";
	var fingerData = fingerPositions;

	var extendedFingers = fingersExtended;
	var grabStrength = parseFloat(handGrabStrength);

	// Sign Data
	var signObject  = null;
	var signName = "";
	var signExtendedFingers = "";
	var signPosition = null;
	var signTranslationWord = "";

	var requiredExtendedFingerCount = null;
	

	// Use if a fingers needs a position 
	var requiredFingers = null;

	var requiredPositions = {
		x: 0,
		y: 0,
		z: 0,
	};

	var xData = [];
	var yData = [];
	var zData = [];

	// Loops through the sign array JSON
	for(var s = 0; s < signArray.signs.length; s++){
		signObject = signArray.signs[s];

		// Load current sign information into variables
		signName = signObject.name;
		signExtendedFingers = signObject.extendedFingers;
		signPosition = signObject.position;
		signTranslationWord = signObject.translation;

		signLessThan = signObject.lessThan;
		signGreaterThan = signObject.greaterThan;
		
		// Checks
		if(signExtendedFingers !== null && signPosition !== null && signLessThan !== null && signGreaterThan !== null){
			requiredFingers = signPosition.fingers.split(',');
			for(var i = 0; i < fingerPositions.length; i++){
				for(var f = 0; f < requiredFingers.length; f++){
					if(requiredFingers[f] === fingerPositions[i].finger){
						xData[f] = fingerPositions[i].x;				
						yData[f] = fingerPositions[i].y;
						zData[f] = fingerPositions[i].z;	
					}
				}
			}

			var dist = calculateDistanceBetweenTwoPoints3D(xData, yData, zData);
			console.log(dist);
			if(dist <= signLessThan && dist >= signGreaterThan){
				console.log("Less: " + dist + " <= " + signLessThan);
				console.log("Greater: " + dist + " >= " + signGreaterThan);
				translationResult = signTranslationWord;
			}
		}
		
		// Basic number translation
		if(signExtendedFingers != null && signPosition === null){
			if(!hideNumbers){
				if(parseInt(signExtendedFingers) === extendedFingers && grabStrength === 0.0){
					translationResult = signTranslationWord;
				}
			}
		}
		// Currently only supports two required fingers
		if (signExtendedFingers === null && signPosition != null)
		{				
			requiredFingers = signPosition.fingers.split(',');
			requiredPositions.x = signPosition.position.x;
			requiredPositions.y = signPosition.position.y;
			requiredPositions.z = signPosition.position.z;

			var requiredDis = Math.sqrt(Math.pow(requiredPositions.x, 2) + Math.pow(requiredPositions.y, 2) + Math.pow(requiredPositions.z, 2));

			for(var i = 0; i < fingerPositions.length; i++){
				for(var f = 0; f < requiredFingers.length; f++){
					if(requiredFingers[f] === fingerPositions[i].finger){
						xData[f] = fingerPositions[i].x;				
						yData[f] = fingerPositions[i].y;
						zData[f] = fingerPositions[i].z;	
					}
				}
			}
			var dist = calculateDistanceBetweenTwoPoints3D(xData, yData, zData);

			// Handles Pinching motions
			if(dist <= requiredDis && grabStrength <= 0.200){
				translationResult = signTranslationWord;
			}
		}
		
		if(signExtendedFingers === null && signPosition === null){
			// Check for a fist
			if(grabStrength === 1.0){
				translationResult = signTranslationWord;	
			} 
		}

		// Checks if the sign is making the sign "Good". 
		// In the future I would like to move this into the above statements, to be handled there.
		if(signExtendedFingers === 1 && signPosition != null){
			requiredFingers = signPosition.fingers.split(',');

			console.log(requiredFingers);
			if(grabStrength === 1 && extendedFingers === 1){
				translationResult = signTranslationWord;
			}
		}
	}

	displayToTranslationBox(translationResult);
}


// Only supports two points at presents
// Returns the distance between two points in a 3d space
function calculateDistanceBetweenTwoPoints3D(x,y,z){
	var x = x[1] - x[0];
	var y = y[1] - y[0];
	var z = z[1] - z[0];

	var dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
	return dist;
}