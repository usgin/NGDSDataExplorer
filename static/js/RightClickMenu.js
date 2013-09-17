/*************************************************************************************************************************************************
/	Right Click Menu (Context Menu)
/	Create the components the make up the context menu for the layer list:
/		- Zoom to Layer Extent
/ 		- View Table of All Features
/		- View Table of Selected Features
/		- Export All Features to a CSV
/		- Export Selected Features to a CSV
/		- Remove Layer
/		- Get the URL of the WFS Server
/		- Layer Metadata
/************************************************************************************************************************************************/

// Create the right click menu for the layers panel
function CreateContextMenu(){
	return new Ext.menu.Menu({
	    items: [{
	        text: "Zoom to Layer Extent",
	        icon: 'static/images/zoom-layer-icon.png',
	        handler: function () {
	            var node = layersPanel.getSelectionModel().getSelectedNode();
	            if (node && node.layer) {
	                this.map.zoomToExtent(node.layer.getDataExtent());
	            }
	        },
	        scope: this
	    },{
	        text: "Export All Features to a CSV",
	        icon: 'static/images/excel-icon.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	ExportSingleLayer(node.layer, "csv", "all");
	        }
	    },{
	        text: "Export All Features to a Table",
	        icon: 'static/images/table-icon.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	ExportSingleLayer(node.layer, "html", "all");
	        }
	    },{
	        text: "Export Selected Features to a CSV",
	        icon: 'static/images/excel-icon.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	ExportSingleLayer(node.layer, "csv", "selected");
	        }
	    },{
	        text: "Export Selected Features to a Table",
	        icon: 'static/images/table-icon.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	ExportSingleLayer(node.layer, "html", "selected");
	        }
	    },/*{
	        text: "Clear Selected",
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
				console.log(node);
	        }
	    },*/{
	        text: "Remove Layer",
	        icon: 'static/images/remove-layer-icon.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	RemoveLayer(node.layer);
	        	//console.log(activeLayer);
	        /*	if (activeLayer != undefined)
	        		console.log("activeLayer name: " + activeLayer.name);
	        	else
	        		console.log("active is not defined"); */
	        }
	    },{
	        text: "Get the URL of the WFS Server",
	        icon: 'static/images/link.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	window.prompt ("Copy to clipboard: Ctrl+C/Cmd+C, Enter", node.layer.protocol.url);
	        }
	    },{
	        text: "Layer Metadata",
	        icon: 'static/images/metadata-icon.png',
	        handler: function () {
	            if (!winContext) {
	                var node = layersPanel.getSelectionModel().getSelectedNode();
	                var layername = node.text;
	                var winContext = new Ext.Window({
	                    title: '<span style="color:#00; font-weight:bold;"></span>' + layername,
	                    layout: 'fit',
	                    text: layername,
	                    width: 800,
	                    height: 500,
	                    closeAction: 'hide',
	                    plain: true,
	                   	items: CreateMetadata(node.layer),
	                    buttons: [{
	                        text: 'Close',
	                            handler: function () {
	                                winContext.hide();
	                            }
	                        }]
	                    });
	                }
	            winContext.show(this);
	        },
	        scope: this
		}]
	});
}
 
// Create the text for the Metadata window       
function CreateMetadata(layer) {
	var items = [];
	
	if (layer.isBaseLayer == true) {
		items.push({
			xtype: 'panel',
			autoScroll: true,
			html: '<b>' + layer.name + '</b>'
		});
	}
	else {	
		var html = "<b><u> Service Identification </u></b> <br>";
		html = GetKeys(layer.cap.serviceIdentification, html);
		html += "<br>";
		html += "<b><u> Service Provider </u></b> <br>";
		html = GetKeys(layer.cap.serviceProvider, html);

		items.push({
			xtype: 'panel',
			autoScroll: true,
			html: html
		});
	}
	return items;
}

// Loop through the keys printing the key and its value, or subkeys if the key is an object
function GetKeys(obj, html) {
	for (var key in obj) {
		keyPrint = FixKeyFormat(key);
		if (obj.hasOwnProperty(key)) {
			if (obj[key] instanceof Object == false) {
				html += "<b>" + keyPrint + "</b>: " + obj[key] + "<br>";
		}
		else {
			html += "<b>" + keyPrint + ":</b><br>";
  			var obj2 = obj[key];
			html = GetSubKeys(obj2, html);
	  		}
		}
	}
	return html;
}

// Loop through the subkeys printing the subkey and its value, or subkeys if the subkey is an object
function GetSubKeys(obj, html) {
	for (var prop in obj) {
		propPrint = FixKeyFormat(prop);
		if (obj.hasOwnProperty(prop)) {
			if (obj[prop] instanceof Object == false) {
				html += "&nbsp;&nbsp;&nbsp;&nbsp;" + propPrint + ": " + obj[prop] + "<br>";
			}
			else {
				html += "<b>" + propPrint + ":</b><br>";
	      		var obj2 = obj[prop];
				html = GetSubKeys(obj2, html);
			}
		}
	}
	return html;
}

// Format the keys (change providerName to Provider Name)
function FixKeyFormat(s) {
	// Put a space between a lowercase letter followed by an uppercase letter (providerName)
	s = s.replace(/([a-z])([A-Z])/, "$1" + " " + "$2");
	// Change the string to title case
  	return s.toLowerCase().replace( /\b((m)(a?c))?(\w)/g, function($1, $2, $3, $4, $5) { if($2){return $3.toUpperCase()+$4+$5.toUpperCase();} return $1.toUpperCase(); });
}

// Remove a layer from the layer list
function RemoveLayer(layer) {
	
	if (layer.isBaseLayer == false) {
		ToggleLegend("close");

		// Get the index of the additional layer creation for selection
		index = map.layers.indexOf(layer);
		selLayer = map.layers[index + 1];

		// Remove the layers
		layer.removeAllFeatures();
		map.removeLayer(layer, false);
		selLayer.removeAllFeatures();
		map.removeLayer(selLayer, false);
		
		// If the layer being removed was the active layer, activeLayer is now undefined
		if (layer == activeLayer)
			activeLayer = undefined;

		// Fix the zoom
		ResetLayersExtent();
		ZoomToLayersExtent();
	}
	else
		alert("Can't remove a baselayer.");
}