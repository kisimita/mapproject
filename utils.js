	
	var utils = new utilsObject();
	
	function utilsObject(){}
	
	/**
	* Obtains a WebGL context for the canvas with id 'canvas-element-id'
	* This function is invoked when the WebGL app is starting.
	*/
	utilsObject.prototype.getGLContext = function(name){
	    
		var canvas = document.getElementById(name);
		var ctx = null;
		
		if (canvas == null){
			alert('there is no canvas on this page');
			return null;
		}
		else {
			c_width = canvas.width;
			c_height = canvas.height;
		}
				
		var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
		for (var i = 0; i < names.length; ++i) {
		try {
			ctx = canvas.getContext(names[i]);
		} 
		catch(e) {}
			if (ctx) {
				break;
			}
		}
		if (ctx == null) {
			alert("Could not initialise WebGL");
			return null;
		}
		else {
			return ctx;
		}
	}
	
	/**
	* Utilitary function that allows to set up the shaders (program) using an embedded script (look at the beginning of this source code)
	*/
	utilsObject.prototype.getShader = function(gl, id) {
       var script = document.getElementById(id);
       if (!script) {
           return null;
       }

		var str = "";
		var k = script.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (script.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (script.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
	
	utilsObject.prototype.requestAnimFrame = function(o){
		requestAnimFrame(o);
	}
	
	utilsObject.prototype.findNeighBor= function(d, xa, ya, xb, yb){
		var sinalpha = (yb - ya)/(Math.sqrt((xb - xa)*(xb - xa) + (yb - ya)*(yb - ya)));
		var cosalpha = Math.sqrt(1 - sinalpha*sinalpha);
		
		var xc;
		var yc;
		// goc phan tu thu 4
		if((xa < xb) && (ya > yb)) {
			xc = xa + d * (-sinalpha);
			yc = ya + d * cosalpha;
		} else if((xa < xb) && (ya < yb)) { // goc phan tu 1
			xc = xa - d * (sinalpha);
			yc = ya + d * cosalpha;
		} else if((xa > xb) && (ya < yb)) { // goc phan tu 2
			xc = xa - d * (sinalpha);
			yc = ya - d * cosalpha;
		} else if((xa > xb) && (ya > yb)) { // goc phan tu 3
			xc = xa + d * (-sinalpha);
			yc = ya - d * cosalpha;
		}
		
		
		var point = new Object();
		point.x = xc;
		point.y = yc;
		return point;
	}
	
				



	/**
	* Provides requestAnimationFrame in a cross browser way.
	*/
	requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
	})();
	