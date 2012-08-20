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
        tooltip: "zoom to max extent"
    });
    actions["max_extent"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");
	
	// Zoom to active layer						     !!!!!!!!!!!!!!!!!!!!!!!!!!!! NOT WORKING !!!!!!!!!!!!!!!!!!!!!!!
/*    action = new GeoExt.Action({
		//control: ZoomActiveLayer(),
		handler: function () {
			if (activeLayer != undefined){
				new OpenLayers.Control.zoomToExtent(activeLayer.getDataExtent());				
				var bounds = new OpenLayers.Bounds("-113.1667, 31.5, -109.25, 36.5").transform(wgs84, googleMercator);    // Hardcoded for testing
				map.zoomToExtent(bounds);
			}
		},
        map: map,
		disabled: false,
        text: "zoom layer",
        tooltip: "zoom to active layer"
    });
    actions["zoom_layer"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");
*/	
	// Navigation history
    ctrl = new OpenLayers.Control.NavigationHistory();
    map.addControl(ctrl);

    action = new GeoExt.Action({
        text: "previous",
        control: ctrl.previous,
        disabled: true,
        tooltip: "previous in view history"
    });
    actions["previous"] = action;
    toolbarItems.push(action);

    action = new GeoExt.Action({
        text: "next",
        control: ctrl.next,
        disabled: true,
        tooltip: "next in view history"
    });
    actions["next"] = action;
    toolbarItems.push(action);
	toolbarItems.push("-");
	
	// Button to allow for the drawing of a polygon
/*	action = new GeoExt.Action({
		text: "draw poly",
		control: new OpenLayers.Control.DrawFeature(
			polyLayer, OpenLayers.Handler.Polygon
		),
		handler: PolyLayerSelect(),
		map: map,
		toggleGroup: "draw",
		allowDepress: true,
		tooltip: "draw polygon"
	});
    actions["draw_poly"] = action;
    toolbarItems.push(action);
	
	// Button to clear any user-drawn polygons
	action = new GeoExt.Action({ 
        text: "clear poly",
        tooltip: "clear user-drawn polygon(s)",
        map: map,		
		handler: function(item, pressed) {
			polyLayer.destroyFeatures();
		}
    });
    actions["clear_poly"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");
*/	

	// Button to allow for selection of features by drawing a box     
	action = new Ext.Action({ 
        text: "select box",
        tooltip: "draw a box to select multiple features",
		enableToggle: true, 
		toggleHandler: function(button, state) {
			if (state == true){
				selectBoxCtrl.activate();
				selectCtrl.deactivate();
			}
			else {
				selectCtrl.activate();
				selectBoxCtrl.deactivate();
			}
		}
    });
    actions["select_box"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");	


	// Button to clear all selected features
	action = new GeoExt.Action({ 
        text: "clear selected",
        tooltip: "clear all selected features",
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
        tooltip: "show popups with feature data",
		enableToggle: true, 
		toggleHandler: function(button, state) {
			if (state == true)
				showPopups = true;
			else
				showPopups = false;
		}
    });
    actions["show_popups"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");	
	
	// Create an html table
	action = new GeoExt.Action({ 
        text: "create table",
        tooltip: "create html table of selected features from active layer",
        map: map,
		handler: function(item, pressed) {
			ExportToHTMLTable();		
			}
    });
    actions["create_html"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");	
	
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
			},{
				text: "Report Bug / Request Features",
				handler: function(button, evt) {
					helpBugsFeatures();
				}
			},{
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

// Zoom to the feature extent of the active layer    					 !!!!!!!!!!!!!!!!!!!!!  Not being used  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function ZoomActiveLayer(){
	var zoomCtrl = [];
	if (activeLayer != undefined) {
		zoomCtrl.push(new OpenLayers.Control.zoomToExtent(OpenLayers.Bounds(-113.1667, 31.5, -109.25, 36.5)));
		zoomCtrl.push(new OpenLayers.Control.zoomToExtent(activeLayer.getDataExtent()));
	}
	//console.log(zoomCtrl);
	return zoomCtrl[0];
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
		value:          'Select a Data Service:',
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
				Busy(record.data.name);
				GetCapabilities(this.getValue());
			}
		}
	}]);
	
	// Create a button with a text field for a user inputed base url
	dataServicesToolbar.push([{
		text: "Url",
	    //icon: 'http://localhost/Libraries/ext-3.4.0/examples/menu/list-items.gif', // icons can also be specified inline
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