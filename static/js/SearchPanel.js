/*************************************************************************************************************************************************
/	Catalog Search Panel
/	Create the components that make up the Catalog Search Panel:
/		- Search field drop-down box
/		- Search term text box
/		- Use Current Extent Checkbox
/		- Search button
/		- Results grid (see Main.js)
/		- Number of Results
/		- Add Layer button
/************************************************************************************************************************************************/

// Create the form to specify the search parameters
function SearchForm(){
	var searchItems = [];
	
/*	// State the catalog being searched
	searchItems.push([{
		width: 188, 
		xtype: 'label',
		fieldLabel: 'catalog',
		text: 'AASG Geothermal Data Catalog'
	}]);*/
	
	// Create the search field selection drop-down box
	// Defaults to 'Any Text'
	searchItems.push([{
		width: 188,
		xtype:          'combo',
		mode:           'local',
		value:          'Any Text',
		triggerAction:  'all',
		forceSelection: false,
		editable:       false,       
		//labelWidth: 	0,		
		//fieldLabel:    'Title',
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
	
	// Create the search term input text box
	// Input required by user for search
	searchItems.push([{
		width: 188, 
		fieldLabel: 'Search Term',
		value: 'Enter Search Term',
        name: 'first',
		xtype: 'textfield',
		selectOnFocus: true,
        allowBlank:false,
		enableKeyEvents: true,
		listeners: {
			'keyup': function(evt, e) {
				searchTerm = evt.el.dom.value;
			}
		}
	}]);

	// Create the Use Current Map Extent checkbox
	// Defaults to faults
	searchItems.push([{
		xtype: 'checkbox',
		boxLabel: 'Use Current Map Extent',
		name: 'useVisibleExtent',
		checked: false,
		listeners: {
			'check': function(elem) {
				useVisibleExtent = elem.checked;
			}
		}
	}]);
	
	return searchItems;
}

// Create the button to start the search
function SearchButton () {
	return { 
		text: 'Search', 
		listeners: {
			click: function(node,e){
				DoSearch();
			}
		}
	};
}

// Perform the search by calling GetRecordsCSW
function DoSearch() {
	// Remove leading and trailing whitespace and wildcards
	searchTerm = searchTerm.trim();
	//searchTerm = searchTerm.replace("*", "");
	if (searchTerm == "")
		alert("Enter a search term.");
	//else if (searchTerm == "*")
	//	alert("Too many results. Enter a search term.");
	else {
		// If there is more than one search term and they are not separated by an AND or OR already
		// then add an AND between the words
		if(searchTerm.match(/\sOR\s/g) == null && searchTerm.match(/\sAND\s/g) == null ) {
			searchTerm = searchTerm.replace(/\s+/g, " AND ");
		}
		// console.log(searchTerm)
		var cswUrl = 'http://catalog.stategeothermaldata.org/geoportal/csw?';
		GetRecordsCSW(cswUrl);
	}
}

// Create the bottom bar containing:
//  - A display for the number of records returned
//  - A button to add the selected layer to the layer list
function CreateSearchBBar(){
	return new Ext.ux.StatusBar({
		id: 'search-statusbar',
		
		// Initial State
		text: "0 results",
	 
		// Button to add the selected layer to the layer list
		items: [{
			text: 'Add Layer',
			tooltip: 'Add selected service to layers list',
			handler: function () {
				GetDataServices();
			}
		}]
	});
}

function GetDataServices() {
	if (store != undefined) {
		// Get the WFS reference Url for the selected data service
		var ref = store.data.items[curRow].data.references;
		// Keep only the base Url
		var baseUrl = ref.split('?')[0];
		GetCapabilities(baseUrl);
	}
}