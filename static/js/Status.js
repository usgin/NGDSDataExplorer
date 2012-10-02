// Create the statusbar for displaying Ready or Loading & the Remove Layer button
function CreateStatusbar(){
	return new Ext.ux.StatusBar({
		id: 'basic-statusbar',
		text: 'Ready',
		iconCls: 'x-status-valid',
		items: [{
			text: 'Remove Layer',
			tooltip: 'Remove highlighted layer from layers list.',
			handler: function (){
				RemoveLayer();
			}
		}]
	})
}

// Remove a layer from the layer list
function RemoveLayer() {
	// If a layer (activeLayer) has been selected remove it
	if (activeLayer != undefined) {
		//console.log(checkedLayers);
		//console.log(checkedFeatures);
		
		// Remove activeLayer from checkedLayers array
		checkedLayers.splice(checkedLayers.indexOf(activeLayer), 1);
		
		// Remove features in activeLayer from checkedFeatures array
		for (var i=0; i < checkedFeatures.length; i++) {
			if (checkedFeatures[i].layer.name == activeLayer.name) {
				checkedFeatures.splice(i, 1);
				i--;
			}
		}
		//console.log(checkedLayers);
		//console.log(checkedFeatures);
		
		// Remove features in activeLayer from selFeatures array
		for (var i=0; i < selFeatures.length; i++) {
			if (selFeatures[i].layer.name == activeLayer.name) {
				selFeatures.splice(i, 1);
				i--;
			}
		}		
		
		// Remove all features from activeLayer
		activeLayer.removeAllFeatures();
		
		// Remove activeLayer
		map.removeLayer(activeLayer);
		
		// activeLayer is now undefined
		activeLayer = undefined;
	}
	else {
		// If the basemap is the only layer
		if (map.getNumLayers() == 1)
			alert("Add a layer first.");
		else
			alert("Select a layer to remove.");
	}
}

// Set cursor to wait and statusbar to loading
function Busy() {
	document.body.style.cursor = 'wait';
	var sb = Ext.getCmp('basic-statusbar');
	sb.showBusy();
}

// Set cursor to default and statusbar to ready
function Ready() {
	document.body.style.cursor = 'default';
	var sb = Ext.getCmp('basic-statusbar');
	sb.setStatus({
		text: 'Ready',
		iconCls: 'x-status-valid'
	});
}