/*************************************************************************************************************************************************
/	Right Click Menu (Context Menu)
/	Create the components the make up the context menu for the layer list:
/		- Zoom to Layer Extent
/ 		- Metadata
/************************************************************************************************************************************************/

// Create the right click menu for the layers panel
function CreateContextMenu(){
	return new Ext.menu.Menu({
	    items: [{
	        text: "Zoom to Layer Extent",
	        handler: function () {
	            var node = layersPanel.getSelectionModel().getSelectedNode();
	            if (node && node.layer) {
	            	if (node.layer.isBaseLayer == false) {
	                	this.map.zoomToExtent(node.layer.getDataExtent())
	               }
	               else {
	               		this.map.zoomToExtent(node.layer.maxExtent)
	               }
	            }
	        },
	        scope: this
	    },{
	        text: "Metadata",
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
	                                winContext.hide()
	                            }
	                        }]
	                    });
	                }
	            winContext.show(this);
	        },
	        scope: this
	        },{
	        text: "Remove Layer",
	        handler: function () {
	        	var node = layersPanel.getSelectionModel().getSelectedNode();
	        	RemoveLayer(node.layer);
	        }
	    }]
	})
}
 
// Create the text for the Metadata window       
function CreateMetadata(layer) {
	var items = []
	
	if (layer.isBaseLayer == true) {
		items.push({
			xtype: 'panel',
			autoScroll: true,
			html: '<b>' + layer.name + '</b>'
		});
	}
	else {	
		var html = "<b><u> Service Identification </u></b> <br>"
		html = GetKeys(layer.cap.serviceIdentification, html)
		html += "<br>"
		html += "<b><u> Service Provider </u></b> <br>"
		html = GetKeys(layer.cap.serviceProvider, html)

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
		keyPrint = FixKeyFormat(key)
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
		propPrint = FixKeyFormat(prop)
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
		UpdateLayers(layer);
		// Remove all features from layer
		layer.removeAllFeatures();
		map.removeLayer(layer, false);
		ResetLayersExtent();
		ZoomToLayersExtent();
	}
	else {
		alert("Can't remove a baselayer.");
	}
}

function UpdateLayers(layer) {
	//console.log(checkedLayers.length+" layers before remove");
	// If the layer being removed is checked
		if (IsIn(checkedLayers, layer) == true) {
			//console.log(checkedFeatures);
			
			// Remove activeLayer from checkedLayers array
			checkedLayers.splice(checkedLayers.indexOf(layer), 1);
			ToggleLegend();
			
			// Remove features in activeLayer from checkedFeatures array
			for (var i=0; i < checkedFeatures.length; i++) {
				if (checkedFeatures[i].layer.name == layer.name) {
					checkedFeatures.splice(i, 1);
					i--;
				}
			}
		}
		//console.log(checkedLayers.length+" layers after remove");
		//console.log(checkedFeatures);
		
		// Remove features in activeLayer from selFeatures array
		for (var i=0; i < selFeatures.length; i++) {
			if (selFeatures[i].layer.name == layer.name) {
				selFeatures.splice(i, 1);
				i--;
			}
		}		
}
