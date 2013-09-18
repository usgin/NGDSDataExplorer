/*************************************************************************************************************************************************
/	Make a request to the AASG Geothermal Data Catalog with the inputed search parameters
/ 	Format the results
/************************************************************************************************************************************************/

// Request records from the CSW service
function GetRecordsCSW(cswUrl) {
	var cswXML;
	var cswFormat;
	
	Busy();
	
	try {
		OpenLayers.Request.GET({
			url: cswUrl,
			async: false,
			params: CreateParams(),
			callback: function(resp){
				Ready();
				// Response OK
				if (resp.status == 200) {				
					cswXML= resp.responseText;
					CreateCSWStore(cswXML);
				}
				else if (resp.status == 404){
					MyAlert("Unable to reach " + cswUrl + ". Try again later.");
				}
				else{
					MyAlert("Unable to reach " + cswUrl + ". Try again later.");
				}
			}
		});
	}
	catch (e){
		Ready();
		MyAlert("Search failed.");
	} 
}

// Create the paramaters to send to the server with CSW request
function CreateParams() {
	var startPos = 1;
	var maxRecords = "100000";
	//searchTerm = "borehole";
	if (useVisibleExtent == false) {
		var params = {
			request: "GetRecords",
			service: "CSW",
			version: "2.0.2",
			resultType: "results",
			typeNames: "csw:Record",
			elementSetName: "full",
			startPostion: startPos,
			maxRecords: maxRecords,
			// constraint: "<ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'><ogc:And><ogc:PropertyIsLike wildCard='*' singleChar='.' escapeChar='!'><ogc:PropertyName>"+searchField+"</ogc:PropertyName><ogc:Literal>"+searchTerm+"</ogc:Literal></ogc:PropertyIsLike></ogc:And></ogc:Filter>",
			constraint: "<Filter xmlns='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'><And><PropertyIsLike wildCard='*' singleChar='.' escape='!'><PropertyName>AnyText</PropertyName><Literal>*WFS*</Literal></PropertyIsLike><PropertyIsLike wildCard='*' singleChar='.' escape='!'><PropertyName>"+searchField+"</PropertyName><Literal>"+searchTerm+"</Literal></PropertyIsLike></And></Filter>",
			contraintLanguage: "FILTER",
			sortBy: "dc:title"
		};
	}
	else {
		var searchBounds = map.getExtent();
		var newBounds = searchBounds.transform(googleMercator, wgs84);
	
		var params = {
			request: "GetRecords",
			service: "CSW",
			version: "2.0.2",
			resultType: "results",
			typeNames: "csw:Record",
			elementSetName: "full",
			startPostion: startPos,
			maxRecords: maxRecords,
			// constraint: "<ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'><ogc:And><ogc:And><ogc:PropertyIsLike wildCard='*' singleChar='.' escapeChar='!'><ogc:PropertyName>"+searchField+"</ogc:PropertyName><ogc:Literal>"+searchTerm+"</ogc:Literal></ogc:PropertyIsLike></ogc:And><ogc:BBOX><ogc:PropertyName>apiso:BoundingBox</ogc:PropertyName><gml:Envelope xmlns:gml='http://www.opengis.net/gml' srsName='EPSG:4326'><gml:lowerCorner>"+newBounds.left.toString()+" "+newBounds.bottom.toString()+"</gml:lowerCorner><gml:upperCorner>"+newBounds.right.toString() + " " + newBounds.top.toString()+"</gml:upperCorner></gml:Envelope></ogc:BBOX></ogc:And></ogc:Filter>",
			constraint: "<Filter xmlns='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'><And><And><PropertyIsLike wildCard='*' singleChar='.' escape='!'><PropertyName>AnyText</PropertyName><Literal>*WFS*</Literal></PropertyIsLike><PropertyIsLike wildCard='*' singleChar='.' escape='!'><PropertyName>"+searchField+"</PropertyName><Literal>"+searchTerm+"</Literal></PropertyIsLike></And><BBOX><PropertyName>apiso:BoundingBox</PropertyName><gml:Envelope xmlns:gml='http://www.opengis.net/gml' srsName='EPSG:4326'><gml:lowerCorner>"+newBounds.left.toString()+" "+newBounds.bottom.toString()+"</gml:lowerCorner><gml:upperCorner>"+newBounds.right.toString() + " " + newBounds.top.toString()+"</gml:upperCorner></gml:Envelope></BBOX></And></Filter>",
			contraintLanguage: "FILTER",
			sortBy: "dc:title"
		};
	}
	return params;
}

// Create the store for the CSW results
function CreateCSWStore(cswXML) {
	var cswXMLnoNS = RemoveNS(cswXML);
	//console.log(cswXMLnoNS);

	var xmlDoc;
	if (window.DOMParser) {
		var parser = new DOMParser();
		xmlDoc = parser.parseFromString(cswXMLnoNS,"text/xml");
	}
	else {// Internet Explorer
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(cswXMLnoNS); 
	}
	
	// Get rid of services that aren't web feature services
	var xmlDocClean = RemoveNonWFS(xmlDoc);
	//console.log(xmlDocClean);
	
	// Query the selected catalog service and create the data store
	 store = new Ext.data.XmlStore({
		proxy: new Ext.data.MemoryProxy(xmlDocClean),
		record: 'Record',
		fields: [
			'title', 'abstract', 'references'
		]
    });
	store.load();
	//console.log(store);
	
	SetNumOfResults();
	
	if (store.data.length == 0) {
		var noData = [ ['No data services found.'] ];
		var emptyStore = new Ext.data.ArrayStore({
			fields: [
			   {name: 'title'}
			]
		});
		emptyStore.loadData(noData);
		gridPanel.reconfigure(emptyStore, gridPanel.getColumnModel());
	}
	else 
		gridPanel.reconfigure(store, gridPanel.getColumnModel());

}

// Remove any services that aren't WFS
function RemoveNonWFS(xmlObject) {
	// Pull out all the record nodes
	var records = xmlObject.getElementsByTagName("Record");

	// Examine each record node
	for (var i = 0; i < records.length; i++) {
		// Pull out all the reference nodes
		var references = records[i].getElementsByTagName("references");

		var found = false;
		
		// Examine each reference for the record to see if there is a WFS reference
		for (var j = 0; j < references.length; j++) {
			var theRef = references[j].firstChild.data;
			//console.log(theRef);
			
			// If the reference is for a WFS set found to true
			if (theRef.search("service=WFS") != -1)
				found = true;
			// If the reference is not for a WFS delete the reference node
			else {
				references[j].parentNode.removeChild(references[j]);
				j--;
			}
		}
		
		// If the record node didn't have a WFS remove it
		if (found == false) {
			//console.log(i);
			records[i].parentNode.removeChild(records[i]);
			i--;
		}
	}
	
	return xmlObject;
}

// Set the number of reults below the results grid
function SetNumOfResults() {
	var numOfServices = store.data.length.toString();
	//console.log(numOfServices);
	
	var sb = Ext.getCmp('search-statusbar');
	if (numOfServices == 1)
		sb.setStatus({
			text: numOfServices + " record"
		});
	else
		sb.setStatus({
			text: numOfServices + " records"
		});
}

// Remove the namespaces from the XML because Firefox and IE can't parse them 
// when making the Ext store
function RemoveNS(xmlString){
	// define the regex pattern to remove the namespaces from the string
	var xmlnsPattern = new RegExp("xmlns[^\"]*\"[^\"]*\"", "gi");

	// remove the namespaces from the string representation of the XML
	var namespaceRemovedXML = xmlString.replace(xmlnsPattern, "");

	// Remove the namespaces from each element's opening and closing tag
	// replace the '<csw:' from '<csw:GetRecordsResponse ... > with '<'
	var namespacePattern = new RegExp("<[a-z]*:", "gi");
	namespaceRemovedXML = xmlString.replace(namespacePattern, "<");

	// replace the '</csw:' from '<csw:GetRecordsResponse> with '<'
	namespacePattern = new RegExp("<\/[a-z]*:", "gi");
	namespaceRemovedXML = namespaceRemovedXML.replace(namespacePattern, "</");

return namespaceRemovedXML;
}