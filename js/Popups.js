// Create a popup to display the data of the selected feature
function CreatePopup(feature){
	//console.log(feature);
	//var popupTitle = feature.layer.featureType;
	var popupTitle = feature.layer.name;
	var featureInfoHTML="";
	var featureInfo = feature.data;
	
	// Create the HTML for the popup from the feature's data
	for (var i in featureInfo){
		featureInfoHTML = featureInfoHTML+"<b>"+ i +"</b>: "+featureInfo[i]+"<br>";
	}
	//console.log(popupTitle);
	popup = new GeoExt.Popup({
            title: popupTitle,
            location: feature,
            width: 500,
			height: 300,
            html: featureInfoHTML,
			autoScroll: true,
            maximizable: true,
            collapsible: true
        });
    popup.show();
}

// Create a popup to display the distance measured
function CreateMeaurementPopup(output){
	//console.log(feature);
	//var popupTitle = feature.layer.featureType;
	var popupTitle = "Measurement";
	var featureInfoHTML="test";
//	var featureInfo = feature.data;
	
	// Create the HTML for the popup from the feature's data
	//for (var i in featureInfo){
	//	featureInfoHTML = featureInfoHTML+"<b>"+ i +"</b>: "+featureInfo[i]+"<br>";
	//}
	//console.log(popupTitle);
	var popupM = new GeoExt.Popup({
			id: "measurementPopup",
            title: popupTitle,
            location: new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat),
            width: 500,
			height: 300,
            html: featureInfoHTML,
			autoScroll: true,
            maximizable: true,
            collapsible: true
        });
    popupM.show();
}