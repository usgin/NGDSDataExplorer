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
	        text: "Layer Information",
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
		                    items: CreateTabs(node.layer),
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

// Create the tabbed views
function CreateTabs(layer){
	var layerInfo = GetLayerInfo(layer);
    var tabs = new Ext.TabPanel({
        region: 'center',
        margins:'3 3 3 0', 
        activeTab: 0,
        defaults:{autoScroll:true},

        items:[{
            title: 'Description',
            html: layerInfo[0]
        },{
            title: 'Model Versions',
            html: layerInfo[1]
        },{
            title: 'Field List',
            html: layerInfo[2]
        },{
            title: 'Metadata',
            html: CreateMetadata(layer)
        }]
    });
    
    return tabs;
}

// Get the layer information from http://schemas.usgin.org/contentmodels.json     
function GetLayerInfo(layer) {

	ns = layer.protocol.featureNS;
    layer_name = layer.protocol.featureType
	// The following is a hack because the services still use the old namespaces
	newUri = ns.replace("stategeothermaldata.org/uri-gin/aasg/xmlschema", "schemas.usgin.org/uri-gin/ngds/dataschema");

	var items = [];	
	for (var i = 0; i < layersInfo.length; i++) {
		var ver = layersInfo[i].versions;
		for (var j = 0; j < ver.length; j++) {
			if (ver[j].uri == newUri) {
				var layerInfo = layersInfo[i];
				var layerFields = ver[j].layers_info[layer_name];
				break;
			}
		}
	}

	// If the namepace URI cannont be crossreferenced at http://schemas.usgin.org/contentmodels.json layerInfo will be undefined
	if (layerInfo != undefined) {
		
		var layerDescHtml = "<html><b> Title: </b>" + layerInfo.title + "</b> <br>";
		layerDescHtml += "<b> URI: </b> <a href=\"" + layerInfo.uri + "\" target=\"_blank\">" + layerInfo.uri + "</a><br>";
		layerDescHtml += "<b> Last Updated: </b>" + layerInfo.date_updated + "<br>";
		layerDescHtml += "<b> Description: </b>" + layerInfo.description + "<br>";
		layerDescHtml += "<b> Discussion: </b>" + layerInfo.discussion + "<br>";
		layerDescHtml += "<b> Status: </b>" + layerInfo.status + "<br>";
		layerDescHtml += "</html>";
		
		var layerVersions = layerInfo.versions;
		var layerVersHtml = "<html>";
		for (var i = 0; i < layerVersions.length; i++) {
			layerVersHtml += "<b> Version: </b>" + layerVersions[i].version + "<br>";
			layerVersHtml += "<b> URI: </b> <a href=\"" + layerVersions[i].uri + "\" target=\"_blank\">" + layerVersions[i].uri + "</a><br>";
			layerVersHtml += "<b> Date Created: </b>" + layerVersions[i].date_created + "<br>";
			layerVersHtml += "<b> XLS file: </b> <a href=\"" + layerVersions[i].xls_file_path + "\" target=\"_blank\">" + layerVersions[i].xls_file_path + "</a><br>";
			layerVersHtml += "<b> XSD file: </b> <a href=\"" + layerVersions[i].xsd_file_path + "\" target=\"_blank\">" + layerVersions[i].xsd_file_path + "</a><br>";
			layerVersHtml += "<b> WFS Sample Request: </b> <a href=\"" + layerVersions[i].sample_wfs_request + "\" target=\"_blank\">" + layerVersions[i].sample_wfs_request + "</a><br><br>";
		}
		layerVersHtml += "</html>";
		
		var fieldListHtml = "<html>";
		fieldListHtml += "<i>Bold field names indicate required fields.</i><br>";
		for (var i = 0; i < layerFields.length; i++) {
			if (layerFields[i].optional == true)
				fieldListHtml += "<br>" + layerFields[i].name + " (" + layerFields[i].type + "): " + layerFields[i].description + "<br>";
			else
				fieldListHtml += "<br><b>" + layerFields[i].name + " (" + layerFields[i].type + ")</b>: " + layerFields[i].description + "<br>";
		}
		
		fieldListHtml += "</html>";
	}
	else {
		var layerDescHtml = "<html> Unable to get the layer description.</html>";
		var layerVersHtml = "<html> Unable to get the layer versions.</html>";
		var fieldListHtml = "<html> Unable to get the field list.</html>";
		var html = "<html>Unable to find information about this layer.<br>";
	}
	
	return [layerDescHtml, layerVersHtml, fieldListHtml];
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

	return html;
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