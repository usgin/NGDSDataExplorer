// Items in the drop-down help menu on the Map Panel Toolbar

function DoSearch() {
	if (searchTerm == "")
		alert("Enter a search term.");
	else {
		if (searchCatService == undefined)
			searchCatService = 'http://catalog.stategeothermaldata.org/geoportal/csw?';

		GetRecordsCSW();
	}
}

// Help Menu Item - Help using this application
function Search(){
	var searchItems = [];
	
	// Create the Catalog Services combo box
/*	searchItems.push([{
		width: 			188,
		xtype:          'combo',
		mode:           'local',
		value:          'http://catalog.stategeothermaldata.org/geoportal/csw?',
		triggerAction:  'all',
		forceSelection: false,
		editable:       false,       
		//labelWidth: 	0,		
		//fieldLabel:     'Title',
		name:           'title',
		displayField:   'name',
		valueField: 	'value',
		store: 			new Ext.data.JsonStore({
			fields: ['name', 'value'],
			data: [
				{name: 'USGIN AASG Geothermal Data Catalog', value: 'http://catalog.stategeothermaldata.org/geoportal/csw?'},
				{name: 'Test', value: 'http://wygl.wygisc.org/wygeolib/csw/discovery?'}
			]
		}),
		listeners: {
			'select': function(combo, record){
				//console.log(record.data.name);
				searchCatService = record.data.value;
			}
		}
	}]);*/
	
		// Create the Catalog Services combo box
	searchItems.push([{
		width: 188,
		xtype:          'combo',
		mode:           'local',
		value:          'Any Text',
		triggerAction:  'all',
		forceSelection: false,
		editable:       false,       
		//labelWidth: 	0,		
		//fieldLabel:     'Title',
		name:           'title',
		displayField:   'name',
		valueField: 	'value',
		store: 			new Ext.data.JsonStore({
			fields: ['name', 'value'],
			data: [
				{name: 'Any Text', value: 'AnyText'},
				{name: 'Title', value: 'dc:title'},
				{name: 'Abstract', value: 'dc:abstract'}
			]
		}),
		listeners: {
			'select': function(combo, record){
				searchField = record.data.value;
			}
		}
	}]);
	
	searchItems.push([{
		width: 188, 
		fieldLabel: 'Search Term',
		value: 'Enter Search Term',
        name: 'first',
		xtype: 'textfield',
		selectOnFocus: true,
        allowBlank:false,
		listeners: {
			'change': function(elem,evnt) {
				searchTerm = evnt;
			}
		}
	}]);

	searchItems.push([{
		xtype: 'checkbox',
		boxLabel: 'Use Current Map Extent',
		name: 'useVisibleExtent',
		checked: true,
		listeners: {
			'check': function(elem) {
				useVisibleExtent = elem.checked;
			}
		}
	}])
	
	return searchItems;
}

function CreateSearchBBar(){
	return new Ext.ux.StatusBar({
		id: 'search-statusbar',
		
		// Initial State
		text: "0 results",
	 
		items: [{
			text: 'Add Layer',
			tooltip: 'Add selected service to layers list',
			handler: function (){
				if (cswResults != undefined)
					if (cswResults.records.length > 0)
						getUrl(cswResults.records[curRow].references);
				
			}
		}]
	})
}