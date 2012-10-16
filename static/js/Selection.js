/*************************************************************************************************************************************************
/	Selected Layers & Features
/	- Create the control that allows for the selection of features
/	- Set the selected features
/	- Set the active layer and active features (selected features on the active layer)
/ 	- Set the checked layer(s) and checked features (selected features on the checked layer(s))
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
			if (showPopups == true){
				CreatePopup(e.feature);
				}
			//console.log(e.feature);
			//console.log("selected feature "+e.feature.id+" on "+e.feature.layer.name);
			
			// Add the selected feature to the list of selected features
			selFeatures.push(e.feature);
			//console.log(selFeatures);
			
			//for (var i=0; i < checkedLayers.length; i++) {
			//	if (e.feature.layer.name == checkedLayers[i].name)
					checkedFeatures.push(e.feature);
			//}
			//console.log(checkedFeatures);
			
			// If an active layer has been set and if the selected feature is in the active layer add it to activeFeatures
			if (activeLayer != undefined) {
				if (e.feature.layer.name == activeLayer.name){
					// If all features of the layer had been added to activeFeatures
					// (ie. no individual features had been selected previously)
					// clear activeFeatures first
					if (activeLayer.features.length == activeFeatures.length) {
						activeFeatures = [];
					}
					activeFeatures.push(e.feature);
				}
			}
			//console.log("features:");
			//console.log(selFeatures);
			//console.log("activeFeatures:");
			//console.log(activeFeatures);
		},
		"featureunselected": function(e) {
			// If a popup has been opened, close it on unselect
			if (popup != undefined)
				popup.close();
				
			// Remove selected feature from features array
			selFeatures.splice(selFeatures.indexOf(e.feature), 1);
			//console.log(selFeatures);
			checkedFeatures.splice(checkedFeatures.indexOf(e.feature), 1);
			//console.log(checkedFeatures);
			
			// If an active layer has been set and is the same layer as the layer of the feature that has just been unselected
			// Remove the feature from activeFeatures but if it was the feature in activeFeatures and activeFeatures is now empty
			// Then all features of the active layer are active features
			if (activeLayer != undefined) {
				if (e.feature.layer.name == activeLayer.name){
					activeFeatures.splice(activeFeatures.indexOf(e.feature), 1);
					if (activeFeatures.length == 0)
						activeFeatures = activeLayer.features;
				}
				//console.log(activeFeatures);
			}
		}
	});
}

// Set layr in node parameter as the active layer and set the active features for that layer
function SetActive(node){
	//console.log("activeLayer name:");
	//console.log(node.layer.name);
	//console.log("node:");
	//console.log(node);
	//console.log(selFeatures);
	
	// Don't set the active layer if baselayer or root clicked
	if (node.isRoot != true && node.text != "Google Hybrid" && node.text != "Google Streets" && node.text != "Google Terrain"){
		if (node.layer.features != undefined) {
			// Set selected layer to the layer the user clicked
			activeLayer = node.layer;
			
			// No features have been selected so set all features in active layer as the active features
			if (selFeatures.length == 0){
				activeFeatures = activeLayer.features;
			}
			else{
				// Clear activeFeatures
				activeFeatures = [];
			
				// For each selected feature add it to activeFeatures only if in the active layer
				for (var i = 0; i < selFeatures.length; i++) {
					if (activeLayer.name == selFeatures[i].layer.name)
						activeFeatures.push(selFeatures[i]);
				}
				
				// If none of the selected features are in the active layer add all features in that layer to activeFatures
				if (activeFeatures.length == 0){
					activeFeatures = activeLayer.features;				
				}					
			}
		}
	}
	else {
		activeLayer = undefined;
		activeFeatures = [];
	}
	//console.log("activeFeatures:");
	//console.log(activeFeatures);
}

// Add layer in node parameter to the checkedLayers array and 
// add any selected featues on this layer to checkedFeatures
// If checked layer is the active layer, add selected features to activeFeatures
function LayerChecked(node) {
	// If no layers are already checked, open the legend panel
	if (checkedLayers.length == 0) {
		var lp = Ext.getCmp('legendPanel');
		lp.expand();
	}

	// Add the checked layer to the checkedLayers array
	checkedLayers.push(node.layer);
	
	// Add the selected features on the checked layer to the checkedFeatures array
	for (var i=0; i < selFeatures.length; i++) {
		if (selFeatures[i].layer.name == node.layer.name)
			checkedFeatures.push(selFeatures[i]);
	}
	 
	// If no active layer has been set yet, set the checked layer as the active layer
	/*if (activeLayer == undefined) {
		node.select();
		SetActive(node);
	}	*/
	
	// If the checked layer is the same as the active layer set the active features
	if (activeLayer != undefined) {
		if (node.layer.name == activeLayer.name)	
			SetActive(node);
	}
}

// Remove layer in node parameter from checkedLayers array and
// remove that layer's selected features from checkedFeatures array
function LayerUnchecked(node) {
	checkedLayers.splice(checkedLayers.indexOf(node.layer), 1);
	for (var i=0; i < checkedFeatures.length; i++) {
		if (checkedFeatures[i].layer.name == node.layer.name) {
			checkedFeatures.splice(i, 1);
			i--;
		}
	}
	
	// If no layers left checked close the legend panel
	if (checkedLayers.length == 0) {
		var lp = Ext.getCmp('legendPanel');
		lp.collapse();
	}
}