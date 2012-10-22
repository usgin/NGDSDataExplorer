/*************************************************************************************************************************************************
/	Export to Table or CSV
/	- Create an html table
/	- Create a csv file
/************************************************************************************************************************************************/

// Create a html table in a new window for the feature data with the feature attributes as the headings
function ExportData(outputType) {
	//console.log(activeLayer);
	var output = "";
	var success = false;
	
	// If no layers are checked
	if (checkedLayers == 0)
		alert("Check a layer or layers to use in the table.");
	// If exactly one layer is checked use that layer for the table headings
	else if (checkedLayers.length == 1) {
		if (checkedFeatures.length >= 1) {
			output = WriteHeaders(checkedLayers[0], outputType);
			if (WriteTable(output, outputType) == true)
				success = true;
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
							output = WriteHeaders(activeLayer, outputType);
							if (WriteTable(output, outputType) == true)
								success = true;
						}
					}
					// If the feature types of the checked layers match
					else {
						output = WriteHeaders(activeLayer, outputType);
						if (WriteTable(output, outputType) == true)
							success = true;
					}
				}
				// If the active (highlighted) layer is NOT one of the checked layers
				else {
					if (MatchingFeatureTypes() == false) {
						if (confirm("Warning! Feature type MISMATCH!\nColumn headings will be taken from: "+ activeLayer.name + "\n\n Continue anyway?") == true) {
							output = WriteHeaders(activeLayer, outputType);
							if (WriteTable(output, outputType) == true)
								success = true;
						}
					}
					else {
						if (confirm("Warning!\nColumn headings will be taken from: "+ activeLayer.name + "\n\n Continue anyway?") == true) {
							output = WriteHeaders(activeLayer, outputType);
							if (WriteTable(output, outputType) == true)
								success = true;
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
	return success;
}

// Write the table headers
function WriteHeaders(headersLayer, outputType) {
	// Set all attributes for the active layer
	GetAttributes(headersLayer.protocol);
	
	// Write the column headers as html
	if (outputType == "html") {
		var theHeaders = "<html><title>"+headersLayer.name+"</title>";		
		theHeaders += "<head><style type='text/css'>td{width:200px; border-style:ridge; border-width:2px; border-color:#99bbe8; background:white}</style></head>";
		theHeaders += "<body style=\"background-color:#c7dffc\"><table style='width:10000px; border-collapse:collapse; font:11px tahoma,arial,verdana,sans-serif'><tr>";
	
		theHeaders += "<th>Layer Name</th>";
		// Write the attributes to an html table as the column headings
		for (var i=0; i < layerAttributes.length; i++) {
			//console.log(layerAttributes[i].name);
			theHeaders += "<th>"+layerAttributes[i].name+"</th>";
		}
		theHeaders += "</tr>";
	}
	// Write the column headers for a csv file
	else {
		var theHeaders = "\"Layer Name\"";
		// Write the attributes to a string for a csv as the column headings
		for (var i=0; i < layerAttributes.length; i++) {
			//console.log(layerAttributes[i].name);
			theHeaders += ",\""+layerAttributes[i].name+"\"";
		}
		//theHeaders += "\r\n";
		theHeaders += "\n";
	}
	return theHeaders;
}

// Write the table
function WriteTable(output, outputType) {
	// Write the feature data to the html table
	if (outputType == "html") {
		for (var i=0; i < checkedFeatures.length; i++) {
			output += "<tr><td>"+checkedFeatures[i].layer.name+"</td>";				
			for (var j=0; j < layerAttributes.length; j++) {
				var curColName = layerAttributes[j].name;
				var curRowData = checkedFeatures[i].data;
				if ((curRowData[curColName]) == undefined)
					output += "<td></td>";
				else
					output += "<td>"+curRowData[curColName]+"</td>";
			}
			output += "</tr>";
		}				
		output += "</table></body></html>";
		
		// Write the html to a new window
		var htmlWin = window.open("","myWindow");
		htmlWin.document.write(output);
		htmlWin.document.close();
	}
	// Write the feature data for a csv
	else {
		for (var i=0; i < checkedFeatures.length; i++) {
			output += "\""+checkedFeatures[i].layer.name+"\"";				
			for (var j=0; j < layerAttributes.length; j++) {
				var curColName = layerAttributes[j].name;
				var curRowData = checkedFeatures[i].data;
				if ((curRowData[curColName]) == undefined)
					output += ",";
				else
					output += ",\""+curRowData[curColName]+"\"";
			}
			output += "\n";
		}
		
		try {
			var xmlhttp;
			if (window.XMLHttpRequest)
			  // code for IE7+, Firefox, Chrome, Opera, Safari
			  xmlhttp=new XMLHttpRequest();
			else
			  // code for IE6, IE5
			  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			
			// Tell the server to create a csv file with the string output
			xmlhttp.open("POST", "/csv", false);
			xmlhttp.send(output);
			return true;
		}
		catch (e) {
			return false;
		}
	}
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