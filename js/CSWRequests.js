// Retreive data services from the CSW

// Request records from the CSW service
function GetRecordsCSW() {
	var cswXML;
	var cswFormat;
	
	Busy();
	
	try {
		OpenLayers.Request.GET({
			url: searchCatService,
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
					alert("Requested resource not available. Try again later.")
				}
				else{
					alert("Invalid url.");
				}
			}
		})
	}
	catch (e){
		Ready();
		alert("Failed search");
	} 
}

// Create the paramaters to send to the server with CSW request
function CreateParams() {
	var startPos = 1;
	var maxRecords = "1000";
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
			constraint: "<ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'><ogc:And><ogc:PropertyIsLike wildCard='*' singleChar='.' escapeChar='!'><ogc:PropertyName>"+searchField+"</ogc:PropertyName><ogc:Literal>"+searchTerm+"</ogc:Literal></ogc:PropertyIsLike></ogc:And></ogc:Filter>",
			contraintLanguage: "FILTER",
			sortBy: "dc:title"
		};
	}
	else {
		var bounds = map.getExtent();
		var newBounds = bounds.transform(googleMercator, wgs84)
	
		var params = {
			request: "GetRecords",
			service: "CSW",
			version: "2.0.2",
			resultType: "results",
			typeNames: "csw:Record",
			elementSetName: "full",
			startPostion: startPos,
			maxRecords: maxRecords,
			constraint: "<ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'><ogc:And><ogc:And><ogc:PropertyIsLike wildCard='*' singleChar='.' escapeChar='!'><ogc:PropertyName>"+searchField+"</ogc:PropertyName><ogc:Literal>"+searchTerm+"</ogc:Literal></ogc:PropertyIsLike></ogc:And><ogc:BBOX><ogc:PropertyName>apiso:BoundingBox</ogc:PropertyName><gml:Envelope xmlns:gml='http://www.opengis.net/gml' srsName='EPSG:4326'><gml:lowerCorner>"+newBounds.left.toString()+" "+newBounds.bottom.toString()+"</gml:lowerCorner><gml:upperCorner>"+newBounds.right.toString() + " " + newBounds.top.toString()+"</gml:upperCorner></gml:Envelope></ogc:BBOX></ogc:And></ogc:Filter>",
			contraintLanguage: "FILTER",
			sortBy: "dc:title"
		};
	}
	return params;
}

// Create the store for the CSW results
function CreateCSWStore(cswXML) {
	
	var parser = new DOMParser();
	var doc = parser.parseFromString(cswXML,"application/xml");
	var xmlObject1 = doc.documentElement;
	
	var xmlObject = RemoveNonWFS(xmlObject1);
	cswFormat = new OpenLayers.Format.CSWGetRecords();
	cswResults = cswFormat.read(xmlObject);
	
	var RecordDef = Ext.data.Record.create([
		'title', 'abstract'
	]);
	
	// Query the selected catalog service and create the data store
    store = new Ext.data.Store({
		proxy: new Ext.data.MemoryProxy(xmlObject1),
		reader: new Ext.data.XmlReader({
				record: 'Record'
					}, RecordDef)
			
    });
	store.load();
	
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
	
	var records = xmlObject.getElementsByTagName("Record");

	for (var i = 0; i < records.length; i++) {
		var references = records[i].getElementsByTagName("references");

		var found = false;
		
		for (var j = 0; j < references.length; j++) {
			var theRef = references[j].firstChild.data;
			//console.log(theRef);
			
			if (found == false) {
				if (theRef.search("service=WFS") != -1) {
					found = true;
					//console.log(theRef);
				}
			}
		}
		
		// If the node didn't have a WFS remove it
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

// Extracts the base url from the list of urls for the selected data service
function getUrl(curRefs) {
	var t = 0;
	for (var i = 0; i < curRefs.length; i++) {
		if (curRefs[i].match("service=WFS"))
			t = i;
	}
	if (t == 0)
		alert("Requested data service does not offer WFS.");
	else {
		var baseUrl = curRefs[t].split('?')[0];
		GetCapabilities(baseUrl);
	}
}