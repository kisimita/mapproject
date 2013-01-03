var mapnode;
var modelVertexBuffer;
var modelIndexBuffer;
var modelLoaded = false;

var minlat;
var maxlat;
var minlon;
var maxlon;

var realMinLat;
var realMinLon;
var realMaxLat;
var realMaxLon;

var scaleWRatio;
var scaleHRatio;

var map = {
		vertex : [],
		indices: [],
        ways:[]
};

function getJSON() {
		var jqxhr = $.getJSON("example.json", function(json) {
		  alert("JSON data" + json.vertices);
		})
		.success(function() {  })
		.error(function() { alert("error"); })
		.complete(function() {
			//alert("complete");
		});
}

function handleParseVertext(model) {
    modelVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
    modelIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    gl.uniform3f(shaderProgram.modelColor,model.color[0], model.color[1],model.color[2]);
    
    modelLoaded = true;
}

function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

function getANode(id) {
	var nodeInfor = "-";
	mapnode.find("node").each(function () {
		if($(this).attr("id") == id) {
			//alert("Found");
			//nodeInfor += ($(this).attr("lat") + " - " + $(this).attr("lon"));
			
			var worldlat = $(this).attr("lat");
			var worldlon = $(this).attr("lon");
			
			var minlatTemp = lat2tile(minlat, 18);
			var minlonTemp = long2tile(minlon, 18);
			
			var tempLat = lat2tile(worldlat, 18);
			var tempLong = long2tile(worldlon, 18);
			
			nodeInfor += (worldlat + "[" + (worldlat - minlat) + "]" + " - " + worldlon + "[" + (worldlon - minlon) + "]");
			//alert(nodeInfor);
		}
	});
	return nodeInfor;

}

function findBound(node) {
	node.find("node").each(function(){
		var worldlat = $(this).attr("lat")* 10000000;
		var worldlon = $(this).attr("lon")* 10000000;
		if(realMaxLat < worldlat)
			realMaxLat = worldlat;
		if(realMaxLon < worldlon)
			realMaxLon = worldlon;
		if(realMinLat > worldlat )	
			realMinLat = worldlat;
		if(realMinLon > worldlon)
			realMinLon = worldlon;
	});
}

function getBoundary(node) {
	var boundInfo;
	node.find("bounds").each(function () {
		
		minlat = $(this).attr("minlat") * 10000000;
		minlon = $(this).attr("minlon") * 10000000;
		maxlat = $(this).attr("maxlat") * 10000000;
		maxlon = $(this).attr("maxlon") * 10000000;
		
		realMinLat = minlat;
		realMinLon = minlon;
		realMaxLat = maxlat;
		realMaxLon = maxlon;
		
		boundInfo = ("minlat:" + minlat);
		boundInfo += (" - minlon:" + minlon);
		boundInfo += (" - maxlat:" + maxlat);
		boundInfo += (" - maxlon:" + maxlon);
		
		var mapW = maxlat - minlat;
		var mapH = maxlon - minlon;
		boundInfo += (" - mapW data:" + mapW);
		boundInfo += (" - mapH data:" + mapH);
		
		
		
		
	
	});
	
	findBound(node);
	
	
	
	var mapW = realMaxLat - realMinLat;
	var mapH = realMaxLon - realMinLon;
	
	scaleWRatio = 500 / mapW;
	scaleHRatio = 500 / mapH;
	
	boundInfo += (" - mapW:" + mapW);
	boundInfo += (" - mapH:" + mapH);
	boundInfo += (" - scaleWRatio:" + scaleWRatio);
	boundInfo += (" - scaleHRatio:" + scaleHRatio);
	
	
	
	return boundInfo;
}



function getNodeInfo(osmNode, nodeString) {
	var nodeInfo = "</br>";
	
	osmNode.find(nodeString).each(function(){
      //nodeInfo += ("</br>" + $(this).attr("lat") + " - " + $(this).attr("lon"));
      
		var worldlat = $(this).attr("lat")* 10000000;
		var worldlon = $(this).attr("lon")* 10000000;
		
	    //var minlatTemp = lat2tile(minlat, 18);
		//var minlonTemp = long2tile(minlon, 18);
			
		//var tempLat = lat2tile(worldlat, 18);
		//var tempLong = long2tile(worldlon, 18);
		
		
		
		var tempLat = worldlat - realMinLat;
		var tempLong = worldlon - realMinLon;
		
	    
	    map.indices.push(map.indices.length);
        map.vertex.push(tempLong * scaleHRatio);
        map.vertex.push(tempLat * scaleWRatio);
        map.vertex.push(0);
		
		//var output = (worldlat + "[" + (worldlat - minlat) + "]" + " - " + worldlon + "[" + (worldlon - minlon) + "]");
		var output = (worldlat + "[" + (tempLat * scaleWRatio) + "]" + " - " + worldlon + "[" + (tempLong * scaleHRatio) + "]");
	    nodeInfo += output;
		
    });
	/*
	$(osmNode).find("node").each(function () {
		// if($(this).attr("id") == nodeString)
			// nodeInfo += ("</br>" + $(this).attr("lat") + " - " + $(this).attr("lon"));
		// }
		//nodeInfo += "-";
		}
	);
	*/
	
	//nodeInfo += ("</br> minlax:" + realMinLat + " - minlon:" + realMinLon + " - realMaxLat:" + realMaxLat + " - realmaxLon:" + realMaxLon);
	
	return nodeInfo;
}

function getWayInfo(node) {
	var wayInfo = "";
    var streetInfo = new Object();
    
    
    var streetIndex;
    
    if(map.indices == undefined || map.ways.length == 0) {
        streetIndex = 0;
    } else {
        streetIndex = map.indices.length;
    }
    
    streetInfo.start = streetIndex;
    
    console.info("streetInfo.start:" + streetInfo.start);
    
	node.find("nd").each(function () {
		wayInfo += ("</br>ref:" + $(this).attr("ref"));
		var n = "node[id='" + $(this).attr("ref") + "']";
		//var n = $(this).attr("ref");
		var temp = $(this).parent();
		var osmNode = temp.parent();
		//wayInfo += ("</br>ref:" + $(this).parent().find(n));
		wayInfo += getNodeInfo(osmNode, n);
        streetIndex++;
	});
    
    console.info("streetIndex:" + streetIndex);
    
	streetInfo.end = streetIndex - 1;
	node.find("tag").each(function () {
		wayInfo += ("</br>key:" + $(this).attr("k") + " - " + $(this).attr("v"));
	});
	
    map.ways.push(streetInfo);
    
	return wayInfo;
}



function getWays(node) {
	var ways = "";
	$(node).find("way").each(function () {
		ways += ("<p>Way:" + $(this).attr("id"));
		var wayinfo = $(this);
		ways += getWayInfo(wayinfo);
		ways += "</p>"
	});
    
    

    
	return ways;
}

function parseXml(xml) {
	var geninfor;
	var wayinfor;
	var boundary;
	
	var ways;
	$(xml).find("osm").each(function () {
		geninfor = $(this).attr("generator");
		mapnode = $(this);
		boundary = getBoundary(mapnode);
		ways = getWays(mapnode);
	});
	
	//$("#sp").text(wayinfor);
	$("#sp").append("generator - " + geninfor);
	$("#sp").append("</br> Bounds - " + boundary);
	$("#sp").append("</br> ways - " + ways);
	$("#sp").append("</br> vertex - " + map.vertex);
	$("#sp").append("</br> indices - " + map.indices);
    
    // for debug info
    for(var i = 0; i < map.ways.length; i++) {
        $("#sp").append("</br> way - " + i  + ":"+ map.ways[i].start + " - " + map.ways[i].end);
    }
	
	//for boundary information
	/*
	$(xml).find("bounds").each(function () {
		boundary +=("minlat:" $(this).attr("minlat"));
		boundary +=("\t minlon:" $(this).attr("minlon"));
		boundary +=("\t maxlat:" $(this).attr("maxlat"));
		boundary +=("\t maxlon:" $(this).attr("maxlon"));
		
		//alert($(this).attr("generator"));
		//alert(wayinfor);
		$("#sp").append(boundary);
	});
	*/
	/*
	$(xml).find("way").each(function () {
		var $way = $(this);
		wayinfor += "\n way" + $(way).attr("id")
		$(way).find("nd").each(function () {
			wayinfor += (" - " + $(this).attr("ref");
		}); 
		//alert($(this).attr("generator"));
		$("#sp").text("wayinfor");
		alert(wayinfor);
		
		$("#sp").append();
		
	});
	*/
}

