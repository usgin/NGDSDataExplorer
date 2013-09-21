/*************************************************************************************************************************************************
/	Map Panel Toolbar
/	Create the components that make up the Map Panel Toolbar:
/		- Zoom Extent
/		- Previous | Next Views
/		- Set Extent
/		- Select Box
/		- Clear Selected
/		- Identify Feature
/		- Measure
/		- Address Lookup
/		- Merge & View data (see Export.js)
/		- Help (see Help.js)
/************************************************************************************************************************************************/

// Create the toolbar above the map with various actions
function CreateToolbar() {
var ctrl, action, toolbarItems = [], actions = {};

   // Zoom to max extent
    action = new GeoExt.Action({
		handler: function () {
			if (maxLeftB == undefined || maxBottomB == undefined || maxRightB == undefined || maxTopB == undefined)
				alert("Load a data layer first.");
			else {
				// Get the max bounds
				var maxBoundsBox =  new OpenLayers.Bounds(maxLeftB, maxBottomB, maxRightB, maxTopB);	
				// Zoom to the bounds
				map.zoomToExtent(maxBoundsBox);
			}
		},
        map: map,
        text: "Zoom Extent",
        icon: 'static/images/zoom-extent-icon.png',
        tooltip: "Zoom to the maximum extent of all layers, regardless of whether the layer is turned on or off."
    });
    actions["max_extent"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");
	
	// Navigation history
    ctrl = new OpenLayers.Control.NavigationHistory();
    map.addControl(ctrl);

	// Move map to previous view
    action = new GeoExt.Action({
        // text: "Previous View",
        icon: 'static/images/page-prev.gif',
        text: "Views",
        control: ctrl.previous,
        disabled: true,
        tooltip: "Previous in view history."
    });
    actions["previous"] = action;
    toolbarItems.push(action);

	// Move map to next view in history
    action = new GeoExt.Action({
        // text: "Next View",
      	icon: 'static/images/page-next.gif',
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
        text: "Set Extent",
        icon: 'static/images/set-extent-icon.png',
        tooltip: "Only new features within the current map extent will be added when a new layer is loaded.",
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
        text: "Select Box",
        icon: 'static/images/select-box-icon.png',
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
					
					// turn off show popups
					var sp = Ext.getCmp('show_popups');
					sp.toggle(false);
					showPopups = false;
					
					// turn off measure
					var m = Ext.getCmp('measure');
					m.toggle(false);
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
        text: "Clear Selected",
        icon: 'static/images/clear-select-icon.png',
        tooltip: "Clear all selected features.",
        map: map,		
		handler: function(item, pressed) {
			if (selectCtrl != undefined)
				selectCtrl.unselectAll();
		}
    });
    actions["clear_selected"] = action;
    toolbarItems.push(action);
    toolbarItems.push("-");
	
	// Button to turn on/off popups       
	action = new Ext.Action({ 
        // text: "Show Popups",
        icon: 'static/images/information.png',
        tooltip: "Identify feature.",
		id: "show_popups",
		enableToggle: true, 
		toggleHandler: function(button, state) {
			if (state == true) {
				showPopups = true;
				
				// turn off select box
				var sb = Ext.getCmp('select_box');
				sb.toggle(false);
				
				// turn off measure
				var m = Ext.getCmp('measure');
				m.toggle(false);
			}
			else {
				showPopups = false;
				
				//get all existing popups
				var popups = Ext.WindowMgr.getBy(function(win){return (win instanceof GeoExt.Popup);});

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
        // text: "Measure",
        icon: 'static/images/ruler.png',
        tooltip: "Measure a distance.",
		id: "measure",
        enableToggle: true, 
		toggleHandler: function(button, state) {
			if (state == true) {
				measureCtrl.activate();
				
				// turn off show popups
				var sp = Ext.getCmp('show_popups');
				sp.toggle(false);
				showPopups = false;
				
				// turn off select box
				var sb = Ext.getCmp('select_box');
				sb.toggle(false);
			}
			else
				measureCtrl.deactivate();
		}
    });
    actions["measure"] = action;
    toolbarItems.push(action);
	toolbarItems.push("-");	
	
	// Address Lookup
	action = new Ext.Action({ 
       // text: "Address Lookup",
        icon: 'static/images/find.png',
        tooltip: "Lookup a location.",
		id: "address",
        handler: function (e) {
			Ext.MessageBox.prompt('Address Lookup', 'Enter the address of a location. e.g. 1000 Independence Ave SW, Washington, DC 20585', function(btn, text) {
				if (text != "")
					PlaceMarker(text);
			});
		}
    });
    actions["address"] = action;
    toolbarItems.push(action);
	toolbarItems.push("-");	
	
	// Merge & View data drop-down menu
	action = new GeoExt.Action({
        text: "Merge Data & Export",
        tooltip: "Merge data from checked layers into one table or a downloadable CSV.",
        handler: function(item, pressed) {
        	// turn off measure
			var m = Ext.getCmp('measure');
			m.toggle(false);
		},
		menu: new Ext.menu.Menu({
			items: [{
				text: "All Features of Checked Layers to a CSV",
				icon: 'static/images/excel-icon.png',
				handler: function(button, evt) {
					ExportMultipleLayers("csv", "all");
				}
			},{
				text: "All Features of Checked Layers to a Table",
				icon: 'static/images/table-icon.png',
				handler: function(button, evt) {
					ExportMultipleLayers("html", "all");
				}
			},{
				text: "Selected Features of Checked Layers to a CSV",
				icon: 'static/images/excel-icon.png',
				handler: function(button, evt) {
					ExportMultipleLayers("csv", "selected");
				}
			},{
				text: "Selected Features of Checked Layers to a Table",
				icon: 'static/images/table-icon.png',
				handler: function(button, evt) {
					ExportMultipleLayers("html", "selected");
				}
			}]
		})
    });
	actions["MergeAndView"] = action;
    toolbarItems.push(action);

    toolbarItems.push("->");	
	
	// Help drop-down menu
	action = new GeoExt.Action({
        text: "Help",
        icon: "static/images/help_icon.png",
        tooltip: "Help",
		menu: new Ext.menu.Menu({
			items: [{
				text: "Using this application",
				icon: "static/images/help_icon.png",
				handler: function(button, evt) {
					HelpUsingApp();
				}
			},{
				text: "Report Bugs / Request Features",
				icon: "static/images/email_add.png",
				handler: function(button, evt) {
					HelpBugsFeatures();
				}
			},{
				text: "About",
				icon: "static/images/ngds-icon.png",
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
	//console.log(bounds);
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
		// Make a HTML link for any Url within the text
		replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		replacedText = featureInfo[i].replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
		featureInfoHTML = featureInfoHTML + "<b>" + i + "</b>: " + replacedText + "<br>";	
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
	var styleMap = new OpenLayers.StyleMap({"default": style});

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
		MyInfo(output);
	}
}

// Use Google Geocoding to find the address and then place a marker
function PlaceMarker(address) {
	
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'address': address }, function (results, status) {
	  	if (status == google.maps.GeocoderStatus.OK) {
	    	console.log("Geocoding Result: " + results[0].geometry.location);
	    	
    		lon = results[0].geometry.location.kb;
			lat = results[0].geometry.location.jb;
			map.setCenter(new OpenLayers.LonLat(lon, lat).transform(wgs84, googleMercator), 13);
			
			var markers = new OpenLayers.Layer.Markers(address);
			map.addLayer(markers);
			
			var size = new OpenLayers.Size(21,25);
			var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
			var icon = new OpenLayers.Icon('static/lib/OpenLayers-2.13.1/img/marker.png', size, offset);
			markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(lon,lat).transform(wgs84, googleMercator),icon));                           
	    }
	    else {
	    	console.log("Geocoding failed: " + status);    
	    	alert("No results found.");                        
	    }
    });
}