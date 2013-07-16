/*************************************************************************************************************************************************
/	WFS Requests made to the Server
/	- Get Capabilities
/ 	- Get Hits
/ 	- Get Feature
/ 	- Describe Feature Type
/************************************************************************************************************************************************/

// Request the GetCapabilities XML from the server to get a list of available features
function GetCapabilities(baseUrl){
	
	// If the select box toggle is pressed, undepress it
	if (selectBox == true) {
		var sb = Ext.getCmp('select_box');
		sb.toggle(false);
	}
	
	// Get the WFS Capabilities from the server
	try {
		Busy();
		OpenLayers.Request.GET({
			url: baseUrl+'?SERVICE=WFS&version=1.1.0&REQUEST=GetCapabilities&namespace=wfs',
			async: false,
			callback: function(resp){
				Ready();
				// Response OK
				if (resp.status == 200) {
					// Format the response as WFS Capabilities
					var CapFormat = new OpenLayers.Format.WFSCapabilities();
					var cap = CapFormat.read(resp.responseText);
					//console.log(cap)
					if (cap.error.success != undefined) {
						if (cap.error.success == false)
							alert("There was a problem with " + baseUrl + ". Try again later.");
					}
					else {	
						// Get the feature layers
						GetLayers(cap, baseUrl)
					}
					
					//console.log(wfsLayers);
				}
				else if (resp.status == 404){
					alert("Unable to reach " + baseUrl + ". Try again later.");
				}
				else{
					alert("Unable to reach " + baseUrl + ". Try again later.");
				}
			}
		})
	}
	catch (e) {
		Ready();
	}	
}

// Get the feature layers for the selected data service
function GetLayers(cap, baseUrl){
	// Get the titile of the data service
	var dataServiceTitle = cap.serviceIdentification.title;
	
	// Check if there are any feature types in the data service
	if (cap.featureTypeList.featureTypes.length == 0)
		alert("There are no feature types in '" + dataServiceTitle + "'.");

	else{		
		// Get each feature layer listed in the capabilities
		for (var i = 0; i < cap.featureTypeList.featureTypes.length; i++) {
			var featureName = cap.featureTypeList.featureTypes[i].name;
			var featureNS = cap.featureTypeList.featureTypes[i].featureNS;
			
			hits = undefined;
			// Get the number of features in the layer
			GetHits(baseUrl, featureName);
		
			var r = true;
			if (hits > 2500)
				r = confirm("There are "+hits+" "+featureName+" features. They make take awhile to draw.\n-Hit cancel\n-Zoom to a smaller area\n-Turn on the set extent toggle on the toolbar.\n-Select the layer again.\nOr hit OK to attempt to draw anyway.");
			if (hits == 0){
				if (bounds != undefined)
					alert("There were 0 "+featureName+"s features returned. Try changing the set extent or turn off the set extent toggle on the toolbar.");
				else
					alert("There were 0 "+featureName+"s features returned. There may be a problem with the server.");
				r = false;
			}

			if (r == true) {
				// Create the server request for the layer
				wfsLayers[l] = new OpenLayers.Layer.Vector(featureName+" ("+dataServiceTitle+")", {
					strategies: [new OpenLayers.Strategy.Fixed()],
					protocol: new OpenLayers.Protocol.WFS({
						//version: "1.1.0",                            //  !!!!!!!!!!!!!! Features aren't drawn if use 1.1.0 !!!!!!!!!!!!!!!!!!
						url: baseUrl,
						featureType: featureName,
						featureNS: featureNS,
						geometryName: "shape"
					}),
					events: new OpenLayers.Events({
						beforefeatureadded: Busy()
					}),
					styleMap: SetStyle(),
					visibility: true
				});
				//console.log(bounds);
				if (bounds != undefined) {
					bboxFilter = new OpenLayers.Filter.Spatial({
						type: OpenLayers.Filter.Spatial.BBOX,
						value: bounds
					});
					wfsLayers[l].filter = bboxFilter;
				}
			
				map.addLayer(wfsLayers[l]);
				MakeSelectable();
				//console.log(map);
				
				// Set the number of features as the title in the legend
				wfsLayers[l].events.register("featureadded", wfsLayers[l], function (e) {
					e.object.styleMap.styles.default.rules[0].title = e.object.features.length.toString() + " features";
				});
				
				// Set the cursor to busy while the layer is loading
				wfsLayers[l].events.register("loadstart", wfsLayers[l], function (e) {
					Busy();
				});
				
				// Set the cursor back to the default after layer has been loaded
				wfsLayers[l].events.register("loadend", wfsLayers[l], function (e) {
					Ready();
					
					// Set the maximum bounds for all the loaded layers & Zoom to those bounds
					SetLayersExtent(e.object);
					ZoomToLayersExtent();				

					if ((e.object == undefined) || (e.object.features.length == 0)) {
						alert(featureName+" wasn't loaded correctly. Try again.");
						//map.removeLayer(e.object);
						//activeLayer = undefined;
						//l--;
						//console.log(wfsLayers);
					}
				});
				
				l++;
			}
			else
				GetSubregion(cap.featureTypeList.featureTypes[i]);
		}
	}	
}

// Request the number of hits (number of features) from the server
function GetHits(baseUrl, featureName){
	// If bounds have not been set with the set extent toggle, find the number of hits without limiting by bounds,
	// but if bounds have been set then find the number of hits within the bounds
	if (bounds == undefined)
		var hitsUrl = baseUrl + "?service=wfs&version=1.1.0&request=GetFeature&typeName="+featureName+"&resultType=hits";
	else
		var hitsUrl = baseUrl + "?service=wfs&version=1.1.0&request=GetFeature&typeName="+featureName+"&resultType=hits&BBOX="+bounds.left+","+bounds.bottom+","+bounds.right+","+bounds.top;
	
	try {
		OpenLayers.Request.GET({
			url: hitsUrl,
			async: false,
			callback: function(resp) {
				// Response OK
				if (resp.status == 200) {				
					//console.log(resp);
					if (resp.responseXML != null) {
						var xmlHits = resp.responseXML.documentElement;
						hits = xmlHits.attributes.getNamedItem("numberOfFeatures").nodeValue;
					}
				}
				else if (resp.status == 404){
					alert("Unable to reach " + baseUrl + ". Try again later.");
				}
				else{
					alert("Unable to reach " + baseUrl + ". Try again later.");
				}
			}
		});
	}
	catch (e) {
		alert("Unable to determine the number of features.");
	}
}

// Call DescribeFeatureType to get list of attributes for the active layer
function GetAttributes(protocol){
	var baseUrl = protocol.url;
	OpenLayers.Request.GET({
		url: baseUrl+'?SERVICE=WFS&version=1.1.0&REQUEST=DescribeFeatureType&namespace=wfs'+'&typeName='+protocol.featureType,
		async: false,
		success: function(resp) {
			// Format the response as WFS Capabilities
			var DesFormat = new OpenLayers.Format.WFSDescribeFeatureType();
			var des = DesFormat.read(resp.responseText);
			
			// Get the number of attributes and the attributes themselves
			layerAttributes = des.featureTypes[0].properties;
		}
	});
}

// Zoom to the bounds of the feature
function GetSubregion(featureType) {	
	// Get the bounds for the feature
	var featBoundsBox =  new OpenLayers.Bounds(featureType.bounds.left, featureType.bounds.bottom, featureType.bounds.right, featureType.bounds.top);
	// Transform
	featBoundsBox = featBoundsBox.transform(wgs84, googleMercator);
	
	// Draw orange highlight for bounding box
/*	var boxLayers;
	boxLayers = new OpenLayers.Layer.Vector(featureType.name + " Box");
	var box = new OpenLayers.Feature.Vector(featBoundsBox.toGeometry());
	boxLayers.addFeatures(box);
	map.addLayer(boxLayers); */
	
	// Outline bounding box in red
/*	var boxes  = new OpenLayers.Layer.Boxes(featureType.name + " Box");
	var box = new OpenLayers.Marker.Box(featBoundsBox);
	boxes.addMarker(box);
	map.addLayer(boxes); */

	// Zoom to the bounds
	map.zoomToExtent(featBoundsBox);
}

// Set the maximum bounds for all the loaded layers 
function SetLayersExtent(obj) {
	// Get the bounds for the current layer
	var curLeftB = obj.getDataExtent().left;
	var curRightB = obj.getDataExtent().right;
	var curTopB = obj.getDataExtent().top;
	var curBottomB = obj.getDataExtent().bottom;
	
	// Set the max bound as the current bound if it's undefined
	if (maxLeftB == undefined)
		maxLeftB = curLeftB;
	if (maxRightB == undefined)
		maxRightB = curRightB;
	if (maxTopB == undefined)
		maxTopB = curTopB;
	if (maxBottomB == undefined)
		maxBottomB = curBottomB;
	
	// Change the max bound if the current bound makes the bounding box larger
	if (curLeftB < maxLeftB)
		maxLeftB = curLeftB;
	if (curRightB > maxRightB)
		maxRightB = curRightB;
	if (curTopB > maxTopB)
		maxTopB = curTopB;
	if (curBottomB < maxBottomB)
		maxBottomB = curBottomB;		
}

// Reset the maximum extent of all the loaded layers
function ResetLayersExtent() {
	maxLeftB = undefined;
	maxRightB = undefined;
	maxTopB = undefined;
	maxBottomB = undefined;
	
	// Get the extent of loaded layers
	for (var i = 0; i < map.layers.length; i++) {
		if (map.layers[i].isBaseLayer != true) {
			if (map.layers[i].features.length != 0) {
				SetLayersExtent(map.layers[i]);
			}
		}
	}
	
	// If all the layers have been removed set map back to center
	if (maxLeftB == undefined || maxRightB == undefined || maxTopB == undefined || maxBottomB == undefined)
		map.setCenter(new OpenLayers.LonLat(-98.583, 39.833).transform(wgs84, googleMercator), 5);
}

// Zoom to the extent of all of the loaded layers
function ZoomToLayersExtent() {
	// Create the bounding box with the max bounds
	var maxBoundsBox =  new OpenLayers.Bounds(maxLeftB, maxBottomB, maxRightB, maxTopB);
	// Zoom to the max bounds
	map.zoomToExtent(maxBoundsBox);
	//console.log(maxLeftB + ", " + maxBottomB + ", " + maxRightB + ", " + maxTopB);
}