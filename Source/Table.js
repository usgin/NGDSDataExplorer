// Create a html table in a new window for the feature data with the feature attributes as the headings
function ExportToHTMLTable() {
	//console.log(activeFeatures);
	// If a layer has been selected and turned on
	if ((activeFeatures != []) && (activeLayer != undefined)){
		if (activeFeatures.length == 0) 
			alert("There are no features selected on "+activeLayer.name+".");
		else {
			// Write the data as html
			var theHTML = "<html><title>"+activeLayer.name+"</title>";
			
			theHTML += "<head><style type='text/css'>td{width:200px; border-style:ridge; border-width:2px; border-color:#99bbe8; background:white}</style></head>";
			
			theHTML += "<body style=\"background-color:#c7dffc\"><table style='width:10000px; border-collapse:collapse; font:11px tahoma,arial,verdana,sans-serif'><tr>";

			// Set all attributes for the active layer
			SetAttributes(activeLayer.protocol.featureType);
		
			// Write the attributes to an html table as the column headings
			for (var i=0; i < layerAttributes.length; i++) {
				//console.log(layerAttributes[i].name);
				theHTML += "<th>"+layerAttributes[i].name+"</th>";
			}
			theHTML += "</tr>"; 

			// Write the feature data to the html table
			for (var i=0; i < activeFeatures.length; i++) {
				theHTML += "<tr>"; 
				for (var j=0; j < layerAttributes.length; j++) {
					var curColName = layerAttributes[j].name;
					var curRowData = activeFeatures[i].data;
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
	}
	else
		alert("Click on a feature layer to make it the active layer.");
}