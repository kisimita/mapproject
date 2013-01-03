var gl = null; // WebGL context
var prg = null; // The program (shaders)
var c_width = 0; // Variable to store the width of the canvas
var c_height = 0; // Variable to store the height of the canvas

var modelVertexBuffer = null; //The vertex buffer for the model
var modelIndexBuffer = null; // The index buffer for the model

var mvMatrix = mat4.create(); // The Model-View matrix
var pMatrix = mat4.create(); // The projection matrix

var model = undefined;
var modelLoaded = false;
var vertexSize = 3;
/**
 * The program contains a series of instructions that tell the Graphic Processing Unit (GPU)
 * what to do with every vertex and fragment that we pass it. (more about this on chapter 3)
 * The vertex shader and the fragment shader together are called the program.
 */
function initProgram() {
    var fgShader = utils.getShader(gl, 'shader-fs');
    var vxShader = utils.getShader(gl, 'shader-vs');
    
    prg = gl.createProgram();
    gl.attachShader(prg, vxShader);
    gl.attachShader(prg, fgShader);
    gl.linkProgram(prg);
    
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        alert('Could not initialise shaders');
    }
    
    gl.useProgram(prg);
    
    prg.vertexPositionAttribute = gl.getAttribLocation(prg, 'aVertexPosition');
    prg.pMatrixUniform = gl.getUniformLocation(prg, 'uPMatrix');
    prg.mvMatrixUniform = gl.getUniformLocation(prg, 'uMVMatrix');
    prg.modelColor = gl.getUniformLocation(prg, 'modelColor'); // Surprise!
}


/**
 * Creates an AJAX request to load a model asynchronously
 */
function loadModel(filename){
    var request = new XMLHttpRequest();
    var resource = "http://"+document.domain+ filename
    request.open("GET",filename);
    request.onreadystatechange = function() {
        console.info(request.readyState +' - '+request.status);
        if (request.readyState == 4) {
            if(request.status == 200) { //OK
                handleLoadedModel(filename,JSON.parse(request.responseText));
            }
            else if (document.domain.length == 0 && request.status == 0){ //OK but local, no web server
                handleLoadedModel(filename,JSON.parse(request.responseText));
            }
            else{
                alert ('There was a problem loading the file :' + filename);
                alert ('HTML error code: ' + request.status);
            }
        }
    }
    request.send();
}

/**
 * Creates the buffers that contain the geometry of the model
 */
function handleLoadedModel(filename,payload) {
    
    model = payload; //save our model in a global variable so we can retrieve it in drawScene
    
    //alert(filename + ' has been retrieved from the server');
    
    modelVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
    
    modelIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    
    gl.uniform3f(prg.modelColor,model.color[0], model.color[1],model.color[2]);
    
    modelLoaded = true;
}

/*
 * draw thick line from start to end(point) with size
 */
function drawThickLine(vertexArray, start, end, size) {
    var startPoint = new Object();
    var endPoint = new Object();
    startPoint.x = vertexArray[start * vertexSize];
    startPoint.y = vertexArray[start * vertexSize + 1];
    startPoint.z = vertexArray[start * vertexSize + 2];
    
    endPoint.x = vertexArray[end * vertexSize];
    endPoint.y = vertexArray[end * vertexSize + 1];
    endPoint.z = vertexArray[end * vertexSize + 2];

    // phuong trinh duong thang qua A va vuong goc voi AB
    // (xA - xB)(y - yA) + (xA - xB)(y - yA) = 0
}

/**
 * Draws the scene
 */
function drawScene(){
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0,0,c_width, c_height);
    
    mat4.perspective(45, c_width / c_height, 0.5, 10000.0, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, -400.0, -1000.0]);
    
    gl.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(prg.mvMatrixUniform, false, mvMatrix);
    gl.enableVertexAttribArray(prg.vertexPositionAttribute);
    
    if (!modelLoaded) return;
    
	/* draw with map data*/
    modelVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(map.vertex), gl.STATIC_DRAW);
    
    
    modelIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(map.indices), gl.STATIC_DRAW);
    
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    //gl.bindBuffer(gl.ARRAY_BUFFER,null);
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBuffer);
    gl.vertexAttribPointer(prg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBuffer);
    //gl.drawElements(gl.LINE_STRIP, (map.ways[1].end - map.ways[1].start + 1), gl.UNSIGNED_SHORT,map.ways[1].start* 2);
    
    console.info("ways " + map.ways.length);
    for(var i = 0; i < map.ways.length; i++) {
        
        var way = new Object();
        way = map.ways[i];
        
        console.info("way " + i + ":" + way.start + " - " + (way.end - way.start + 1));
        
	    gl.drawElements(gl.LINE_STRIP, (map.ways[i].end - map.ways[i].start + 1), gl.UNSIGNED_SHORT,map.ways[i].start*2);
        
    }
        
    var point = utils.findNeighBor(1, 0, 0, 1, -1);
    console.info("point x:" + point.x + " - y:" + point.y);
}

/**
 * Render Loop
 */
function renderLoop() {
    requestAnimFrame(renderLoop);
    drawScene();
}

/**
 * Executes the WebGL application
 * This function is invoked on the onLoad event of the web page.
 */
function runWebGLApp(){
    //Obtains a WebGL context
    gl = utils.getGLContext('canvas-element-id');
    //Initializes the program (shaders). More about this on chapter 3!
    initProgram();
    //Loads a model from the web server using AJAX + JSON
    //loadModel('models/cone.json');
    //getJSON();
    //Renders the scene!
    renderLoop();
}
