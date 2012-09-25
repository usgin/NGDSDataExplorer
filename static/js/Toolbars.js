// Create two toolbars
// 1. The Map Panel Toolbar
// 2. The Data Services Toolbar

// Create the toolbar above the map with various actions
function CreateToolbar() {
var ctrl, action, toolbarItems = [], actions = {};

   // ZoomToMaxExtent
    action = new GeoExt.Action({
        control: new OpenLayers.Control.ZoomToMaxExtent(),
        map: map,
        text: "max extent",
        tooltip: "Zoom to max extent."
    });
    actions["max_extent"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");
	
	// Zoom to active layer						   
    action = new GeoExt.Action({
		//control: ZoomActiveLayer(),
		handler: function () {
			if (activeLayer != undefined)
				map.zoomToExtent(activeLayer.getDataExtent());	
			else
				alert("Select an active layer.");
		},
        map: map,
		disabled: false,
        text: "zoom layer",
        tooltip: "Zoom to highlighted layer."
    });
    actions["zoom_layer"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");
	
	// Navigation history
    ctrl = new OpenLayers.Control.NavigationHistory();
    map.addControl(ctrl);

    action = new GeoExt.Action({
        text: "previous",
        control: ctrl.previous,
        disabled: true,
        tooltip: "Previous in view history."
    });
    actions["previous"] = action;
    toolbarItems.push(action);

    action = new GeoExt.Action({
        text: "next",
        control: ctrl.next,
        disabled: true,
        tooltip: "Next in view history."
    });
    actions["next"] = action;
    toolbarItems.push(action);
	toolbarItems.push("-");
	
	// Set the map extent
	action = new Ext.Action({ 
		id: "setExtentBtn",
        text: "set extent",
        tooltip: "Only new features within the extent will be added to the map.",
        map: map,
		hidden: false,
		enableToggle: true, 
		toggleHandler: function(button, state) {
			if (state == true) 
				SetMapExtent();
			else
				bounds = undefined;
		}
    });
    actions["setExtent"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");	

	// Button to allow for selection of mulitple features by drawing a box     
	action = new Ext.Action({ 
        text: "select box",
        tooltip: "Draw a box to select multiple features.",
		id: "select_box",
		enableToggle: true, 
		toggleHandler: function(button, state) {
			// If select control hasn't been defined yet (no layers added) don't allow toggle to stay depressed
			// otherwise activate the selectBoxCtrl and deactivate the selectCtrl if the toggle is depressed
			if (selectCtrl == undefined) {
				this.toggle(false);
			}
			else{
				if (state == true){
					selectCtrl.deactivate();
					selectBoxCtrl.activate();
					selectBox = true;
				}
				else {
					selectBoxCtrl.deactivate();
					selectCtrl.activate();
					selectBox = false;
				}
			}
		}
    });
    actions["select_box"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");	

	// Button to clear all selected features
	action = new GeoExt.Action({ 
        text: "clear selected",
        tooltip: "Clear all selected features.",
        map: map,		
		handler: function(item, pressed) {
			if (selectCtrl != undefined) {
				selectCtrl.unselectAll();	
				selFeatures = [];
				if (activeLayer != undefined)
					activeFeatures = activeLayer.features;
			}
		}
    });
    actions["clear_selected"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");
	
	// Button to turn on/off popups       
	action = new Ext.Action({ 
        text: "show popups",
        tooltip: "Show popups with feature data.",
		enableToggle: true, 
		toggleHandler: function(button, state) {
			if (state == true)
				showPopups = true;
			else {
				showPopups = false;
				
				//get all existing popups
				var popups = Ext.WindowMgr.getBy(function(win){return (win instanceof GeoExt.Popup)});

				//kill all existing popups
				for (var i =0; i < popups.length; i++)
					popups[i].destroy();
			}
		}
    });
    actions["show_popups"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");	
	
	// Measure a distance
	action = new Ext.Action({ 
        text: "measure",
        tooltip: "Measure a distance.",
        enableToggle: true, 
		toggleHandler: function(button, state) {
			if (state == true) 
				measureCtrl.activate();
			else
				measureCtrl.deactivate();
		}
    });
    actions["measure"] = action;
    toolbarItems.push(action);
	toolbarItems.push("-");	
	  
	// Create an html table
	action = new GeoExt.Action({ 
        text: "create table",
        tooltip: "Create html table of selected features from checked layer. If more than one layer is checked use column headers of highlighted layer.",
        map: map,
		handler: function(item, pressed) {
			ExportToHTMLTable();		
			}
    });
    actions["create_html"] = action;
    toolbarItems.push(action);
	// toolbarItems.push("-");	

    toolbarItems.push("->");	
	
	// Help drop-down menu
	action = new GeoExt.Action({
        text: "Help",
        tooltip: "Help",
		menu: new Ext.menu.Menu({
			items: [{
				text: "Using this application",
				handler: function(button, evt) {
					HelpUsingApp();
				}
			},/*{
				text: "Report Bug / Request Features",
				handler: function(button, evt) {
					helpBugsFeatures();
				}
			},*/{
				text: "About",
				handler: function(button, evt) {
					HelpAbout();
				}
			}]
		})
    });
	actions["Help"] = action;
    toolbarItems.push(action);
	
	return toolbarItems;
}

// Create the toolbar for the data services combo box and the base url input box
function CreateDataServicesToolbar(){
	var dataServicesToolbar = [];
	
	// Create the Data Services combo box
	dataServicesToolbar.push([{
		width:			175, 
		//width:        194,  // Width without the Url button
		xtype:          'combo',
		mode:           'local',
		value:          'Quick-Pick Data Services:',
		triggerAction:  'all',
		forceSelection: false,
		editable:       false,                                
		fieldLabel:     'Title',
		name:           'title',
		displayField:   'name',
		valueField: 	'value',
		store: 			new Ext.data.JsonStore({
			fields: ['name', 'value'],
			data: [
				//{name: 'AZActiveFaults', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZActiveFaults/MapServer/WFSServer'}, // !!!!!! PARSING ERRROR !!!!!
				{name: 'AZaqSpringChemistry', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZaqSpringChemistry/MapServer/WFSServer'},
				{name: 'AZaqWellChemistry', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZaqWellChemistry/MapServer/WFSServer'},
				{name: 'AZBoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZBoreholeTemperatures/MapServer/WFSServer'},
				{name: 'AZDrillStemTests', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZDrillStemTests/MapServer/WFSServer'},
				{name: 'AZThermalSprings', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZThermalSprings/MapServer/WFSServer'},
				{name: 'AZVolcanicVents', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZVolcanicVents/MapServer/WFSServer'},
				{name: 'AZWellHeaders', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZWellHeaders/MapServer/WFSServer'},
				{name: 'AZWellLogs', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZWellLogs/MapServer/WFSServer'},
				{name: 'AZCaActiveFaults', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/CaActiveFaults/MapServer/WFSServer'},
				{name: 'CAaqSpringChemistry', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/CAaqSpringChemistry/MapServer/WFSServer'},
				{name: 'CAaqWellChemistry', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/CAaqWellChemistry/MapServer/WFSServer'},
				{name: 'CABoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/CABoreholeTemperatures/MapServer/WFSServer'},
				{name: 'CAGeothermalAreas', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/CAGeothermalAreas/MapServer/WFSServer'},
				{name: 'CaThermalSprings', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/CaThermalSprings/MapServer/WFSServer'},
				{name: 'CAVolcanicVents', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/CAVolcanicVents/MapServer/WFSServer'},
				{name: 'CAWellHeaders', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/CAWellHeaders/MapServer/WFSServer'},
				{name: 'COaqSpringChemistry', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/COaqSpringChemistry/MapServer/WFSServer'},
				{name: 'COBoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/COBoreholeTemperatures/MapServer/WFSServer'},
				{name: 'COThermalSprings', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/COThermalSprings/MapServer/WFSServer'},
				{name: 'FLBoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/FLBoreholeTemperatures/MapServer/WFSServer'},
				{name: 'IDWellheaders', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/IDWellheaders/MapServer/WFSServer'},
				{name: 'NEBoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/NEBoreholeTemperatures/MapServer/WFSServer'},
				{name: 'OKBoreholeLithIntervals', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/OKBoreholeLithIntervals/MapServer/WFSServer'},
				{name: 'OKBoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/OKBoreholeTemperatures/MapServer/WFSServer'},
				{name: 'ORBoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/ORBoreholeTemperatures/MapServer/WFSServer'},
				{name: 'ORThermalSprings', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/ORThermalSprings/MapServer/WFSServer'},
				{name: 'ORWellHeaders', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/ORWellHeaders/MapServer/WFSServer'},
				{name: 'TXBoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/TXBoreholeTemperatures/MapServer/WFSServer'},
				{name: 'TXWellHeaders', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/TXWellHeaders/MapServer/WFSServer'},
				{name: 'UTActiveFaults', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/UTActiveFaults/MapServer/WFSServer'},
				{name: 'UTaqSpringChemistry', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/UTaqSpringChemistry/MapServer/WFSServer'},
				{name: 'UTBoreholeTemperatures', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/UTBoreholeTemperatures/MapServer/WFSServer'},
				{name: 'UTDrillStemTests', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/UTDrillStemTests/MapServer/WFSServer'},
				{name: 'UTThermalSprings', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/UTThermalSprings/MapServer/WFSServer'},
				{name: 'UTVolcanicVents', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/UTVolcanicVents/MapServer/WFSServer'},
				{name: 'WABoreholeLithIntervals', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/WABoreholeLithIntervals/MapServer/WFSServer'},
				{name: 'WAGeothermalAreas', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/WAGeothermalAreas/MapServer/WFSServer'},
				{name: 'WAWellLogs', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/WAWellLogs/MapServer/WFSServer'},
				{name: 'WYThermalSprings', value: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/WYThermalSprings/MapServer/WFSServer'}
			]
		}),
		listeners: {
			'select': function(combo, record){
				//console.log(record.data.name);
				GetCapabilities(this.getValue());
			}
		}
	}]);
	
	// Create a button with a text field for a user inputed base url
	dataServicesToolbar.push([{
		text: "Url",
	    //icon: '../lib/ext-3.4.0/examples/menu/list-items.gif',
        cls: 'x-btn-icon',
        tooltip: 'Enter a base url.',
		menu: new Ext.menu.Menu({
			items: [{
				text: 'Enter a base url, e.g. http://services.azgs.az.gov/arcgis/services/aasggeothermal/CAaqSpringChemistry/MapServer/WFSServer'
			},{
				xtype:'textfield',
				fieldLabel: 'Base Url',
				name: 'baseUrl',
				width: 650,
				listeners: {
					'specialkey': function(elem,evnt){
						// If the 'Enter' key is pressed get the layers for the url
						if(evnt.getKey() == 13)	{
							GetCapabilities(elem.el.dom.value);
						}
					}
				}
			}]
		})
	}]);
	
	return dataServicesToolbar;
}
