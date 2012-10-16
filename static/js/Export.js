/*************************************************************************************************************************************************
/	Export to Table or CSV
/	- Create an html table
	- Create a csv file
/************************************************************************************************************************************************/

// Create a html table in a new window for the feature data with the feature attributes as the headings
function ExportToHTMLTable() {
	//console.log(activeLayer);
	var theHTML = "";
	
	// If no layers are checked
	if (checkedLayers == 0)
		alert("Check a layer or layers to use in the table.");
	// If exactly one layer is checked use that layer for the table headings
	else if (checkedLayers.length == 1) {
		if (checkedFeatures.length >= 1) {
			theHTML = WriteHeaders(checkedLayers[0]);
			WriteTable(theHTML);
		}
		else
			alert("There are no features selected on checked layer.");
	}
	// If more than one layer is checked
	else if (checkedLayers.length > 1) {
		if (checkedFeatures.length >= 1) {
			if (activeLayer != undefined) {
				// If the active (highlighted) layer is one of the checked layers
				if (IsIn(checkedLayers, activeLayer) == true) {
					// If the feature types of the checked layers do NOT match
					if (MatchingFeatureTypes() == false) {
						if (confirm("Warning! Feature type MISMATCH!\nColumn headings will be taken from: "+ activeLayer.name + "\n\n Continue anyway?") == true) {
							theHTML = WriteHeaders(activeLayer);
							WriteTable(theHTML);
						}
					}
					// If the feature types of the checked layers match
					else {
						theHTML = WriteHeaders(activeLayer);
						WriteTable(theHTML);
					}
				}
				// If the active (highlighted) layer is NOT one of the checked layers
				else {
					if (MatchingFeatureTypes() == false) {
						if (confirm("Warning! Feature type MISMATCH!\nColumn headings will be taken from: "+ activeLayer.name + "\n\n Continue anyway?") == true) {
							theHTML = WriteHeaders(activeLayer);
							WriteTable(theHTML);
						}
					}
					else {
						if (confirm("Warning!\nColumn headings will be taken from: "+ activeLayer.name + "\n\n Continue anyway?") == true) {
							theHTML = WriteHeaders(activeLayer);
							WriteTable(theHTML);
						}
					}
				}
			}
			// If no layer is set as the active (highlighted) layer
			else 
				alert("More than one layer is checked. Highlight the layer whose attributes you would like to use for the table column headings by clicking on the name of a layer.");
		}	
		else 
			alert("There are no features selected on checked layers.");
	}
}

// Write the table headers
function WriteHeaders(headersLayer) {
	// Write the data as html
	var theHeadersHTML = "<html><title>"+headersLayer.name+"</title>";		
	theHeadersHTML += "<head><style type='text/css'>td{width:200px; border-style:ridge; border-width:2px; border-color:#99bbe8; background:white}</style></head>";
	theHeadersHTML += "<body style=\"background-color:#c7dffc\"><table style='width:10000px; border-collapse:collapse; font:11px tahoma,arial,verdana,sans-serif'><tr>";

	// Set all attributes for the active layer
	GetAttributes(headersLayer.protocol);
	theHeadersHTML += "<th>Layer Name</th>";
	// Write the attributes to an html table as the column headings
	for (var i=0; i < layerAttributes.length; i++) {
		//console.log(layerAttributes[i].name);
		theHeadersHTML += "<th>"+layerAttributes[i].name+"</th>";
	}
	theHeadersHTML += "</tr>";
	
	return theHeadersHTML;
}

// Write the table
function WriteTable(theHTML) {
	// Write the feature data to the html table
	for (var i=0; i < checkedFeatures.length; i++) {
		theHTML += "<tr><td>"+checkedFeatures[i].layer.name+"</td>";				
		for (var j=0; j < layerAttributes.length; j++) {
			var curColName = layerAttributes[j].name;
			var curRowData = checkedFeatures[i].data;
			if ((curRowData[curColName]) == undefined)
				theHTML += "<td></td>";
			else
				theHTML += "<td>"+curRowData[curColName]+"</td>";
		}
		theHTML += "</tr>";
	}				
	theHTML += "</table></body></html>";
	
	// Write the html to a new window
	var htmlWin = window.open("","myWindow");
	htmlWin.document.write(theHTML);
	htmlWin.document.close();
}

// Check for matching feature types of multiple layers
function MatchingFeatureTypes() {
	for (var i=0; i < checkedLayers.length-1; i++) {
		for (var j=i+1; j < checkedLayers.length; j++) {
			if (checkedLayers[i].protocol.featureType != checkedLayers[j].protocol.featureType)
				return false;
		}
	}
	return true;		
}

/*
function MatchedSchemas(layerAttributes) {
	for (var i=0; i < layerAttributes.length; i++) {
		for (var j=1; j < layerAttributes.length; j++) {
			if (layerAttributes[i].length != layerAttributes[j].length)
				return false;
			for (var m=0; m < layerAttributes[i].length; m++) {
				for (var n=0; n < layerAttributes[j].length; n++) {
					if (layerAttributes[i][m].name != layerAttributes[j][n].name)
						return false;
				}
			}
		}
	}
	return true;
}*/