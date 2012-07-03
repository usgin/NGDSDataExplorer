// WFS requests made to the server

// Requst the GetCapabilities XML from the server to determine available layers
function GetCapabilities(baseUrl){
	//console.log(usedUrls);
	// Don't make the request if the Url has been called previously
	if (!IsIn(usedUrls, baseUrl)){
		// Get the WFS Capabilities from the server
		try{
			OpenLayers.Request.GET({
				url: baseUrl+'?SERVICE=WFS&version=1.1.0&REQUEST=GetCapabilities&namespace=wfs',
				async: false,
				callback: function(resp){
					Ready();
					// Response OK
					if (resp.status == 200) {
						// Add the urls to the list of urls already called
						usedUrls.push(baseUrl);
					
						// Format the response as WFS Capabilities
						var CapFormat = new OpenLayers.Format.WFSCapabilities();
						var cap = CapFormat.read(resp.responseText);
						//console.log(cap)
						
						// Get the feature layers
						GetLayers(cap, baseUrl);
						//console.log(wfsLayers);
					}
					else if (resp.status == 404){
						alert("Requested resource not available.")
					}
					else{
						alert("Invalid url.");
					}
				}
			})
		}
		catch (e){
			Ready();
		}
	}
	else{
		Ready();
		alert("Data Service selected previously.");
	}
}

// Get the feature layers
function GetLayers(cap, baseUrl){
	// Get each feature layer listed in the capabilities
	for (var i = 0; i < cap.featureTypeList.featureTypes.length; i++) {
		var featureName = cap.featureTypeList.featureTypes[i].name;
		var featureNS = cap.featureTypeList.featureTypes[i].featureNS;
		var dataServiceTitle = cap.serviceIdentification.title;
		
		// Get the number of features in the layer
		var hits = GetHits(baseUrl, featureName);
		var r = true;
		if (hits > 500)
			r = confirm("There are "+hits+" "+featureName+" features which may take awhile to load. Continue?");
		if (hits == 0){
			alert("There were 0 "+featureName+" features returned. There may be a problem with the server.");
			//r = false;
		}
		
		if (r == true) {
			// Create the server request for the layer
			wfsLayers[j] = new OpenLayers.Layer.Vector(featureName+" ("+dataServiceTitle+")", {
				strategies: [new OpenLayers.Strategy.BBOX()],
				protocol: new OpenLayers.Protocol.WFS({
					//version: "1.1.0",                            //  !!!!!!!!!!!!!! Features aren't drawn if use 1.1.0 !!!!!!!!!!!!!!!!!!
					url: baseUrl,
					featureType: featureName,
					featureNS: featureNS,
					geometryName: "shape"
				}),
				styleMap: SetStyle(),
				visibility: false
			});

			map.addLayers([wfsLayers[j]]);
			MakeSelectable();
			
			// Set the cursor to busy while the layer is loading
			wfsLayers[j].events.register("loadstart", wfsLayers[j], function (e) {
				Busy(e.object.protocol.featureType);
			});
			
			// Set the cursor back to the default after layer has been loaded
			wfsLayers[j].events.register("loadend", wfsLayers[j], function (e) {
				Ready();
				if ((e.object == undefined) || (e.object.features.length == 0))
					alert(featureName+" wasn't loaded correctly. There maybe a problem with the server.");
			});
			
			j++;
		}
	}	
}

// Request the number of hits (number of features) from the server
function GetHits(baseUrl, featureName){
	var hitsUrl = baseUrl + "?service=wfs&version=1.1.0&request=GetFeature&typeName="+featureName+"&resultType=hits";
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", hitsUrl, false );
	xmlHttp.send();

	if (xmlHttp.readyState==4 && xmlHttp.status==200) {
		var xmlHits = xmlHttp.responseXML.documentElement;
		var hits = xmlHits.attributes.getNamedItem("numberOfFeatures").nodeValue;
		return hits;
	}
	else 
		return 0;
}

// Call DescribeFeatureType to get list of attributes for the active layer
function SetAttributes(featureName){
	var baseUrl = activeLayer.protocol.url;
	OpenLayers.Request.GET({
		url: baseUrl+'?SERVICE=WFS&version=1.1.0&REQUEST=DescribeFeatureType&namespace=wfs'+'&typeName='+featureName,
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