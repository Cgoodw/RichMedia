// I. MAIN CODE
"use strict";
const ctx = document.querySelector("canvas").getContext("2d");
const canvasWidth = mycanvas.width;
const canvasHeight = mycanvas.height;
let sprites = []; // an array to hold all of our sprites
let gradient = createLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"blue"},{percent:.25,color:"green"},{percent:.5,color:"yellow"},{percent:.75,color:"red"},{percent:1,color:"magenta"}])
let image = new Image();
// #3 - stop using an insecure image
//image.src = "https://vignette.wikia.nocookie.net/yoshi/images/6/68/Yoshi_Happy.png/revision/latest?cb=20150508143229";
image.src = "images/Yoshi_Happy.png";
let showTrails,showImage,showBlending,showNoise,showTint = false,emboss=false;

init();

function init(){
	sprites = createSprites();
	setupUI();
	loop();
}


function loop(){
	// schedule a call to loop() in 1/60th of a second
	requestAnimationFrame(loop);

	// draw background
	ctx.save();
	ctx.fillStyle = gradient;
	// #1 Show Trails
	if (showTrails) ctx.globalAlpha = 0.01;
	ctx.fillRect(0,0,canvasWidth,canvasHeight);
	ctx.restore();
	
	// #2 - Show Image?
	if(showImage){
		ctx.save();
		ctx.scale(.5,.5);
		ctx.globalAlpha = 25/255;
		ctx.drawImage(image,-80,-65);
		ctx.restore();
	}
    
	// loop through sprites, move & draw!
	let counter = 0;
	ctx.save();
	for (let s of sprites){
		// move sprites
		s.move();

		// check sides and bounce
		if (s.x <= s.span/2 || s.x >= canvasWidth-s.span/2){
			s.reflectX();
			s.move();
		}
		if (s.y <= s.span/2 || s.y >= canvasHeight-s.span/2){
			s.reflectY();
			s.move();
		}
		
		// #4 - Show Blending?
		if (showBlending){
			ctx.globalCompositeOperation = counter % 2  ? "color-dodge" : "exclusion";
		}
				
		// draw sprites
		s.draw(ctx);

	} // end for
	ctx.restore();
	
	// BITMAP MANIPULATION
	let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	let data = imageData.data;
	let length = data.length;
	let width = imageData.width; // not using here
	// Iterate through each pixel
    if (emboss){
				// Loop through the subpixels, convoluting each using an edge-detection matrix.
				for(var i = 0; i < length; i++) {
					if( i%4 == 3 ) continue;
					data[i] = 127 + 2*data[i] - data[i + 4] - data[i + width*4];
				}
			}
    
	for (let i = 0; i < length; i +=4) {
		// #5 - Show noise
		// red noise
		if (showNoise && Math.random() < .07){
			data[i] = data[i+1] = data[i+2] = 0;
			data[i] = 255;
		}
		
		// #6 - Show tint
		// magenta tint
		if(showTint){
            let gray=data[i]+data[i+1]+data[i+2];
			data[i] = gray/3;  		// set red value
			data[i+1] = gray/3; 		// set green value
			data[i+2] = gray/3;		// set blue value
			//data[i+3] -= 128;		// set alpha value
		}
		
	}	// end for
	
		// copy data back to canvas
		ctx.putImageData(imageData, 0, 0);	
} // end loop()


// II. HELPER FUNCTIONS

function setupUI(){
			document.querySelector('#trailsCB').checked = showTrails;
			document.querySelector('#showImageCB').checked = showImage;
			document.querySelector('#blendingCB').checked = showBlending;
			document.querySelector('#noiseCB').checked = showNoise;
			document.querySelector('#tintCB').checked = showTint;
            document.querySelector('#embossCB').checked = emboss;
	   		
			document.querySelector('#trailsCB').onchange = e => showTrails = e.target.checked;
			document.querySelector('#showImageCB').onchange = e => showImage = e.target.checked;
			document.querySelector('#blendingCB').onchange = e => showBlending = e.target.checked;
			document.querySelector('#noiseCB').onchange = e => showNoise = e.target.checked;
			document.querySelector('#tintCB').onchange = e => showTint = e.target.checked;
            document.querySelector('#embossCB').onchange = e => emboss = e.target.checked;
		}

function createSprites(num=20){
	// create array to hold all of our sprites
	let sprites = [];
	for(let i=0;i<num;i++){
		// determine random properties and instantiate new RingSprite
		let x = Math.random() * (canvasWidth - 100) + 50;
		let y = Math.random() * (canvasHeight - 100) + 50;
		let span = 15 + Math.random() * 25;
		let fwd = getRandomUnitVector();
		let speed = Math.random() + 2;
		let color = getRandomColor();
		let s = new ringSprite(x,y,span,fwd,speed,color);
	
		// add to array
		sprites.push(s);
	} // end for

	// return  array
	return sprites;
}


