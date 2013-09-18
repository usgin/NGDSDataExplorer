/*************************************************************************************************************************************************
/	Selected Layers & Features
/	- Create the control that allows for the selection of features
/	- Toggle the legend panel open or closed
/************************************************************************************************************************************************/

// Allow for selecting/unselecting a feature and set options	
function MakeSelectable(){
	// Control for only the selection of individual features
	selectCtrl = new OpenLayers.Control.SelectFeature(wfsLayers, {
		clickout: false, 
		toggle: true,
		multiple: true,
		hover: false,
		box: false
	});
	map.addControl(selectCtrl);
	
	// Control for the selecting of mulitple features by drawing a box
	selectBoxCtrl = new OpenLayers.Control.SelectFeature(wfsLayers, {
		clickout: false, 
		toggle: true,
		multiple: true,
		hover: false,
		box: true
	});
	map.addControl(selectBoxCtrl); 
	
	// If the selectBox toggle is not depressed activate selectCtrl otherwise activate selectBoxCtrl
	if (selectBox == false){
		selectBoxCtrl.activate();
		selectBoxCtrl.deactivate();
		selectCtrl.activate();
	}
	else{
		selectCtrl.activate();
		selectCtrl.deactivate();
		selectBoxCtrl.activate();
	}
	
	wfsLayers[l].events.on({
		"featureselected": function(e) {
			if (showPopups == true)
				CreatePopup(e.feature);
		},
		"featureunselected": function(e) {
			if (showPopups == true)
				CreatePopup(e.feature);
		/*	// If a popup has been opened, close it on unselect
			if (popup != undefined)
				popup.close(); */
		}
	});
}

// If no layers are checked collapse the legend panel, otherwise expand it
function ToggleLegend(hack) {
	var checkedLayers = [];
	var lyrs = map.layers;
	for (var i = 0; i < lyrs.length; i++) {
		if (lyrs[i].CLASS_NAME == 'OpenLayers.Layer.Vector' && lyrs[i].visibility == true) {
			checkedLayers.push(lyrs[i]);
		}
	}
	numCheckedLayers = checkedLayers.length;
	
	// In order to close the legend when a layer is removed we need to close the legend
	// (if there are no vector layers left) before the layers are actually removed
	// Only works the first time though
	if (hack == "close")
		numCheckedLayers = numCheckedLayers - 1;

	// If no layers are checked, collapse the legend panel
	if (numCheckedLayers == 0) {
		var lp = Ext.getCmp('legendPanel');
		lp.collapse();
	}
	// Otherwise expand the legend panel
	else {
		var lp = Ext.getCmp('legendPanel');
		lp.expand();
	}
}