/*************************************************************************************************************************************************
/	Right Click Menu (Context Menu)
/	Create the components the make up the context menu for the layer list:
/		- Zoom to Layer Extent
/		- Export All Features to a CSV
/		- Export All Features to a Table
/		- Export Selected Features to a CSV
/		- Export Selected Features to a Table
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
	    },{
	        text: "Remove Layer",
	        icon: 'static/images/remove-layer-icon.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	RemoveLayer(node.layer);
	        }
	    },{
	        text: "Get the URL of the WFS Server",
	        icon: 'static/images/link.png',
	        handler: function (e) {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	if (node.layer.CLASS_NAME == 'OpenLayers.Layer.Vector')
        			Ext.MessageBox.alert('Get WFS URL', node.layer.protocol.url);
        	    else
	        		alert("This layer was not created from a WFS so there is no server URL to obtain.");
        	}
	    },{
	        text: "Layer Description",
	        icon: 'static/images/view_text.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	if (node.layer.CLASS_NAME == 'OpenLayers.Layer.Vector') {
		            if (!winContext) {
		                var layername = node.text;
		                var winContext = new Ext.Window({
		                    title: '<span style="color:#00; font-weight:bold;"></span>' + layername,
		                    layout: 'fit',
		                    text: layername,
		                    width: 800,
		                    height: 500,
		                    closeAction: 'hide',
		                    plain: true,
		                   	items: GetFieldList(node.layer),
		                    buttons: [{
		                        text: 'Close',
		                            handler: function () {
		                                winContext.hide();
		                            }
		                        }]
		                    });
		                }
		            winContext.show(this);
		        	}
		       	else
		       		alert("No metadata for this layer.");      		
		        },
		 	scope: this
		},{
	        text: "Layer Metadata",
	        icon: 'static/images/metadata-icon.png',
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	if (node.layer.CLASS_NAME == 'OpenLayers.Layer.Vector') {
		            if (!winContext) {
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
		        	}
		       	else
		       		alert("No metadata for this layer.");      		
		        },
		 	scope: this
		}]
	});
}

// Create the text for the Metadata window       
function GetFieldList(layer) {

	ns = layer.protocol.featureNS;
	// The following is a hack because the serivces still use the old namespaces
	newUri = ns.replace("stategeothermaldata.org/uri-gin/aasg/xmlschema", "schemas.usgin.org/uri-gin/ngds/dataschema");
	console.log(ns);
	console.log(newUri);
	var items = [];	
	
	for (var i = 0; i < layersInfo.length; i++) {
		var ver = layersInfo[i].versions;
		for (var j = 0; j < ver.length; j++) {
			if (ver[j].uri == newUri) {
				var layerInfo = layersInfo[i];
				var layerFields = ver[j].field_info;
				break;
			}
		}
	}
	
	if (layerInfo != undefined) {
		console.log(layerInfo);
		console.log(layerFields);
		
		var html = "<html><b><u> " + layerInfo.title + " Layer Info </u></b> <br>";
		html += "<b> URI: </b> <a href=\"" + layerInfo.uri + "\" target=\"_blank\">" + layerInfo.uri + "</a><br>";
		html += "<b> Last Updated: </b>" + layerInfo.date_updated + "<br>";
		html += "<b> Description: </b>" + layerInfo.description + "<br>";
		html += "<b> Discussion: </b>" + layerInfo.discussion + "<br>";
		html += "<b> Status: </b>" + layerInfo.status + "<br>";
		
		var layerVersions = layerInfo.versions;
		html += "<br><b><u> Versions </u></b>";
		for (var i = 0; i < layerVersions.length; i++) {
			html += "<br><b> Version: </b>" + layerVersions[i].version + "<br>";
			html += "<b> URI: </b> <a href=\"" + layerVersions[i].uri + "\" target=\"_blank\">" + layerVersions[i].uri + "</a><br>";
			html += "<b> Date Created: </b>" + layerVersions[i].date_created + "<br>";
			html += "<b> XLS file: </b> <a href=\"" + layerVersions[i].xls_file_path + "\" target=\"_blank\">" + layerVersions[i].xls_file_path + "</a><br>";
			html += "<b> XSD file: </b> <a href=\"" + layerVersions[i].xsd_file_path + "\" target=\"_blank\">" + layerVersions[i].xsd_file_path + "</a><br>";
			html += "<b> WFS Sample Request: </b> <a href=\"" + layerVersions[i].sample_wfs_request + "\" target=\"_blank\">" + layerVersions[i].sample_wfs_request + "</a><br>";
		}
		
		html += "<br><b><u> Field List </u></b><br>";
		html += "<i>Bold field names indicate required fields.</i><br>";
		for (var i = 0; i < layerFields.length; i++) {
			if (layerFields[i].optional == false)
				html += "<br>" + layerFields[i].name + " (" + layerFields[i].type + "): " + layerFields[i].description + "<br>";
			else
				html += "<br><b>" + layerFields[i].name + " (" + layerFields[i].type + ")</b>: " + layerFields[i].description + "<br>";
		}
		
		html += "</html>";
	}
	else {
		var html = "<html>Unable to find information about this layer.<br>";
		html += "<a href=\"" + newUri + "\" target=\"_blank\">" + newUri + "</a> cannot be cross-referenced at ";
		html += "<a href=\"http://schemas.usgin.org/models/\" target=\"_blank\">http://schemas.usgin.org/models/</a></html>";
	}
	
	items.push({
		xtype: 'panel',
		autoScroll: true,
		html: html
	});
	return items;
}

 
// Create the text for the Metadata window       
function CreateMetadata(layer) {
	var items = [];
	
	var html = "More a description of this See <ahttp://schemas.usgin.org/models/";
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
	
	if (layer.CLASS_NAME == 'OpenLayers.Layer.Vector') {
		ToggleLegend("close");

		// Get the index of the additional layer created for selection
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
		map.removeLayer(layer, false);
	
	console.log(layer.name + " layer removed");
}