// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec2 v_UV;\n'+
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '   v_UV = a_UV;' + 
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n' +
    'uniform vec4 u_FragColor;\n' + 
    'uniform sampler2D u_Sampler0;\n' + // rock texture (Walls)
    'uniform sampler2D u_Sampler1;\n' + // grass texture (Ground)
    'uniform sampler2D u_Sampler2;\n' + // sky texture (Sky1.webp)
    'uniform int u_whichTexture;\n' +
    'void main() {\n' +
    '   if(u_whichTexture == -2){\n' +  
    '       gl_FragColor = u_FragColor; }\n' + 
    '   else if(u_whichTexture == 0){\n' +  // salls should use rock texture
    '       gl_FragColor = texture2D(u_Sampler0, v_UV); }\n' + 
    '   else if(u_whichTexture == 1){\n' +  // grass texture
    '       gl_FragColor = texture2D(u_Sampler1, v_UV); }\n' +  
    '   else if(u_whichTexture == 2){\n' +  // sky texture
    '       gl_FragColor = texture2D(u_Sampler2, v_UV); }\n' +
    '   else { gl_FragColor = vec4(1, .2, .2, 1); }\n' + // debugging fallback
    '}\n';




// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;

// Global variables for caterpillar animation
let g_CharHoverLocation = -0.3;
let g_tailAngle = 0;
let g_fireSize = 0;
let g_blink = 0;
let g_wingAngle = 40;
let g_limbAngle = 0;
let g_armsAngle = 0;
let g_forearmsAngle = 0;

//Global variables for camera movement 
// Add after your other global variables
let g_isDragging = false;
let g_lastX = -1;
let g_lastY = -1;
let g_mouseScale = 0.5;

let g_CharAnimation = true;

let g_globalAngle = 0;
var g_startTime = performance.now()/1000.0;
var g_seconds   = performance.now()/1000.0 - g_startTime;
let g_camera = new Camera();
let g_map = [
    [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4], 
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3], 
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2], 
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2], 
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3], 
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4]  // Row 31 (front wall)
];


function setupCanvas(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preseveDrawingBuffer: true}); // gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // get the storage location of u_Sample0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if(!u_Sampler0){
        console.log('Failed to create the u_Sampler0 object');
        return;
    }

    // get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }

    // get the storage location of u_Sampler1
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if(!u_Sampler2){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }

    // get the storage location of u_Sampler
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if(!u_whichTexture){
        console.log('Failed to create the u_whichTexture object');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function convertCoordEventToWebGL(ev){
    var x = ev.clientX;                                         // x coordinate of a mouse pointer
    var y = ev.clientY;                                         // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x,y]);
}

function initTextures(){
    // -------------------------------- image 0 (rock) --------------------------------
    var image0 = new Image();
    image0.onload = function(){ sendTextureToTEXTURE0(image0); };
    image0.src = 'rock.jpg'; // ROCK TEXTURE FOR WALLS
    
    //-------------------------------- image 1 (grass) --------------------------------
    var image1 = new Image();
    image1.onload = function(){ sendTextureToTEXTURE1(image1); };
    image1.src = 'grass5.webp'; // GRASS TEXTURE FOR GROUND

    //-------------------------------- image 2 (sky) --------------------------------
    var image2 = new Image();
    image2.onload = function(){ sendTextureToTEXTURE2(image2); };
    image2.src = 'sky3.webp'; // SKY TEXTURE
    
    return true;
}

function sendTextureToTEXTURE0(image){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture0 (rock.jpg) object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    gl.uniform1i(u_Sampler0, 0);
}




function sendTextureToTEXTURE2(image){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture2 object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    gl.uniform1i(u_Sampler2, 2);
}


function sendTextureToTEXTURE1(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture1 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit1
    gl.activeTexture(gl.TEXTURE1);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
}

function sendTextureToTEXTURE2(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture2 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);
}

function sendTextureToTEXTURE3(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture3 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit0
    gl.activeTexture(gl.TEXTURE3);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler3, 3);
}

function main(){
    setupCanvas();                      // set global canvas webGL 
    connectVariablesToGLSL();           // Initialize shaders
    initTextures();
    document.onkeydown = keydown;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Specify the color for clearing <canvas>
    // Clear <canvas>    
    // gl.clear(gl.COLOR_BUFFER_BIT); 
    setupMouseHandlers();
    requestAnimationFrame(tick);

}

function setupMouseHandlers() {
    canvas.onmousedown = function(ev) {
        g_isDragging = true;
        g_lastX = ev.clientX;
        g_lastY = ev.clientY;
    };

    canvas.onmouseup = function(ev) {
        g_isDragging = false;
    };

    canvas.onmousemove = function(ev) {
        if (!g_isDragging) return;

        var deltaX = ev.clientX - g_lastX;
        var deltaY = ev.clientY - g_lastY;
        
        deltaX *= g_mouseScale;
        deltaY *= g_mouseScale;

        g_camera.rotateLookAt(-deltaX, -deltaY);
        
        g_lastX = ev.clientX;
        g_lastY = ev.clientY;
        
        renderAllShapes();
    };
    canvas.onwheel = function(ev) {
        ev.preventDefault();
        var factor = ev.deltaY > 0 ? 0.1 : -0.1;
        if (g_camera && typeof g_camera.zoom === 'function') {
            g_camera.zoom(factor);
            renderAllShapes();
        }
    };
}

function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;
    updateAnimationTransformations();                   // update the angles of my animated blocks
    renderAllShapes();                                  // draw everything
    requestAnimationFrame(tick);                        // tell the browser to update again when it can
}

function updateAnimationTransformations(){
    if(g_CharAnimation){ 
        g_CharHoverLocation = ((Math.sin(g_seconds*3))/30)-(.3);
        g_tailAngle = 5*Math.sin(g_seconds*3);
        g_fireSize = Math.abs( Math.sin(g_seconds*4));
        g_blink = Math.abs(Math.sin(g_seconds*3));
        g_wingAngle = 20*Math.sin(g_seconds*3)+40;
        g_limbAngle = 5*Math.sin(g_seconds*3);
        g_armsAngle = 10*Math.sin(g_seconds*3);
        g_forearmsAngle = 20*Math.sin(g_seconds*3);
    }
}

function keydown(ev){
    if(ev.keyCode      == 68){  g_camera.right();}
    else if(ev.keyCode == 65){ g_camera.left();}
    else if(ev.keyCode == 87){ g_camera.forward();}
    else if(ev.keyCode == 83){ g_camera.backward();}
    else if(ev.keyCode == 69){ g_camera.rotRight();}
    else if(ev.keyCode == 81){ g_camera.rotLeft();}
    else if(ev.keyCode == 90){ g_camera.upward();}
    else if(ev.keyCode == 88){ g_camera.downward();}
    renderAllShapes();
}


function drawCaterpillar() {
    console.log("Drawing caterpillar..."); // debugging output

    // body segments
    for(let i = 0; i < 5; i++) {
        var segment = new Cube();
        segment.color = [0.5, 0.8, 0.5, 1.0]; // green color for caterpillar
        segment.matrix.setTranslate(10 + i*1.2, 0 + g_CharHoverLocation + Math.sin(i + g_seconds)*0.1, 5);
        segment.matrix.rotate(Math.sin(i + g_seconds)*10, 0, 1, 0); // wiggle animation
        segment.matrix.scale(0.8, 0.8, 0.8);
        segment.render();
    }

    // head
    var head = new Cube();
    head.color = [0.6, 0.9, 0.6, 1.0]; // slightly lighter green for head
    head.matrix.setTranslate(10 + 5*1.2, 0 + g_CharHoverLocation + Math.sin(5 + g_seconds)*0.1, 5);
    head.matrix.rotate(Math.sin(5 + g_seconds)*10, 0, 1, 0);
    head.matrix.scale(1, 1, 1);
    head.render();

    // eyes (two small black cubes)
    var leftEye = new Cube();
    leftEye.color = [0, 0, 0, 1];
    leftEye.matrix.setTranslate(10 + 6.4, 0.3 + g_CharHoverLocation + Math.sin(5 + g_seconds)*0.1, 5.3);
    leftEye.matrix.scale(0.2, 0.2, 0.2);
    leftEye.render();

    var rightEye = new Cube();
    rightEye.color = [0, 0, 0, 1];
    rightEye.matrix.setTranslate(10 + 6.4, 0.3 + g_CharHoverLocation + Math.sin(5 + g_seconds)*0.1, 4.7);
    rightEye.matrix.scale(0.2, 0.2, 0.2);
    rightEye.render();
}

function renderAllShapes(){
    var startTime = performance.now();

    // pass the project matrix
    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width/canvas.height, .1, 100); 
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],  
        g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
        g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // pass the global rotate matrix
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1 ,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ------------------ BEGIN RENDERING CUBES ------------------

    drawSetting();
    drawMap();
    drawCaterpillar();
    

}

function drawSetting(){
    // floor (Grass)
    var floor = new Cube();
    floor.textureNum = 1; // grass texture
    floor.matrix.translate(0, -0.75, 0);
    floor.matrix.scale(35, 0.01, 35);
    floor.matrix.translate(-0.15, 0, -0.15);
    floor.render();

    // skybox (sky Texture)
    var sky = new Cube();
    sky.textureNum = 2; // SKY1.WEBP texture
    sky.matrix.translate(-1, 0, -1);
    sky.matrix.scale(60, 60, 60);
    sky.matrix.translate(-0.3, -0.5, -0.3);
    sky.render();
}


function drawMap(){
    for (x = 0; x < 32; x++){
        for (y = 0; y < 32; y++){
            if (g_map[x][y] > 0){  
                for (z = 0; z < g_map[x][y]; z++){
                    var wall = new Cube();
                    wall.textureNum = 0; // FORCE ROCK TEXTURE
                    wall.matrix.translate(y - 4, z - 0.75, x - 4);
                    wall.render();
                }
            }
        }
    }
}

