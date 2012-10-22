/*************************************************************************************************************************************************
/	Map Panel Toolbar
/	Create the components that make up the Map Panel Toolbar:
/		- max extent
/		- zoom layer
/		- previous | next
/		- set extent
/		- select box
/		- clear selected
/		- show popups
/		- measure
/		- create table (see Export.js)
/		- create csv (see Export.js)
/		- help (see Help.js)
/************************************************************************************************************************************************/

// Create the toolbar above the map with various actions
function CreateToolbar() {
var ctrl, action, toolbarItems = [], actions = {};

   // Zoom to max extent
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

	// Move map to previous view
    action = new GeoExt.Action({
        text: "previous",
        control: ctrl.previous,
        disabled: true,
        tooltip: "Previous in view history."
    });
    actions["previous"] = action;
    toolbarItems.push(action);

	// Move map to next view in history
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
	action = new Ext.Button({ 
        text: "create table",
        tooltip: "Create html table of selected features from checked layer. If more than one layer is checked use column headers of highlighted layer.",
        map: map,
		handler: function(item, pressed) {
			ExportData("html");		
		}
    });
    actions["create_html"] = action;
    toolbarItems.push(action);
	toolbarItems.push("-");	
	
	// Create csv file
	action = new Ext.Button({ 
        text: "create csv",
        tooltip: "Create a csv file of selected features from checked layer. If more than one layer is checked use column headers of highlighted layer.",
        map: map,
		handler: function(item, pressed) {
			var madeFile = ExportData("csv");
			if (madeFile == true)
				window.open('/files/data.csv', '_blank');			
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
			},{
				text: "Report Bugs / Request Features",
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

// Set the map extent
function SetMapExtent() {
	map.getExtent();
	var curBounds = map.getExtent();
	bounds = curBounds.transform(googleMercator, wgs84);
 }
 
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
 
// Create the control for the measurement tool
function CreateMeasurementCtrl() {
	var sketchSymbolizers = {
		"Point": {
			pointRadius: 4,
			graphicName: "square",
			fillColor: "white",
			fillOpacity: 1,
			strokeWidth: 1,
			strokeOpacity: 1,
			strokeColor: "#333333"
		},
		"Line": {
			strokeWidth: 3,
			strokeOpacity: 1,
			strokeColor: "#666666",
			strokeDashstyle: "dash"
		}
	};
	var style = new OpenLayers.Style();
	style.addRules([
		new OpenLayers.Rule({symbolizer: sketchSymbolizers})
	]);
	var styleMap = new OpenLayers.StyleMap({"default": style})

	measureCtrl = new OpenLayers.Control.Measure(
		OpenLayers.Handler.Path, {
			persist: true,
			handlerOptions: {
				layerOptions: {styleMap: styleMap}
			}
		}
	);
	
	measureCtrl.events.on({
		"measure": handleMeasurements,
		//"measurepartial": handleMeasurements
	});
	map.addControl(measureCtrl);
}

function handleMeasurements(event) {
	var geometry = event.geometry;
	var units = event.units;
	var measure = event.measure;
	if (measure.toFixed(3) != 0.000) {
		var output  = "Distance = " + measure.toFixed(3) + " " + units;
		alert(output);
		}
}