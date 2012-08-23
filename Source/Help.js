// Items in the drop-down help menu on the Map Panel Toolbar

// Help Menu Item - Help using this application
function HelpUsingApp(){
	new Ext.Window({
		title: 'Using the Application',
		layout: 'fit',
		closable: true,
		closeAction: 'hide',
		maximizable: true,
		width: 500,
		height: 500,
		items: [{
			xtype: 'panel',
			autoScroll: true,
			html: '<b>WFS Map</b><br><br> This program displays features from a WFS on a map, allows for the selection of features, and creates a table of selected features.<br><br>  This program contains the following parts:<br> 1. The Data Service Toolbar<br> 2. The Layer Tree<br> 3. The Map Panel Toolbar<br> 4. The Map Panel<br> 5. The Legend<br><br>  <b>1. The Data Service Toolbar</b><br> The Data Service Toolbar allows for the selection of a Web Feature Service to retrieve. There are two options for specifying the location of a desired WFS.<br> 1. The Data Service Drop-down Menu - Select a data service from the drop-down menu and its layers will be added to the layer tree.<br> 2. Base Url Input - Click the button to the right of the data service drop-down menu. Input a base url as in the example. Press enter. Layers will be added to the tree.<br><br>  <b>2. The Layer Tree</b><br> The Layer Tree lists the layers that available to be show in the map. Check the box next to the layer name to retrieve the layer and make it visible. Uncheck the box to hide the layer. Drag and drop the layer names to change the order of the layers. Click on the name of a layer to highlight the layer in blue and set that layer as the active layer. The Layer Tree panel can be expanded or collapsed by clicking on the arrows. At the bottom of the layer tree panel is a status bar which indicates if a layer is currently loading.<br><br>  <b>3. The Map Panel Toolbar</b><br> The Map Panel Toolbar provides additonal functionality for the the Map Panel. It has the following capabilities:<br> max extent: Zoom to the max extent of the baselayer.<br> zoom layer: Zoom to the extent of the active layer.<br> previous/next: Navigate through the history of map views.<br> select box: Draw a box to select multiple features. <br> clear selected: Unselect all selected features.<br> show popups: When depressed, clicking on a feature will bring up a popup with information about that feature. Close the popup window by clicking the feature again or by clicking the x in the corner of the popup window. Close all open popups by undepressing the \'show popups\' toggle button. create table: Create a table in another browser window containing the data for the selected features in the active layer. If no features are selected the records for all features in the active layer will retrieved.<br><br>  <b>4. The Map Panel</b><br> The Map Panel displays the locations of the features in the checked layer(s). The Map Panel has the following capabilities:<br> Adjust Zoom: Use the + or - buttons in the top left corner or double-click on an area to zoom in.<br> Pan: Click on the up/down, left/right buttons in the top left corner. Or click the map if the \'select box\' button is not depressed.<br> Select Feature(s): Click on a feature to select it. It will turn yellow. Alternatively, depress the \'select box\' button on the toolbar to select multiple features by drawing a box.<br> Unselect Feature(s): Click on a feature to unselect it. Alternatively, click on the \'clear selected\' button in the toolbar to unslected all features.<br><br>  <b>5. The Legend</b><br> The Legend is in a collapsible panel to the right of the map. Expand or collapse the legend by clicking on the arrows.'
			}
		]
	}).show();	
}

// Help Menu Item - Report Bugs/Request Features
function helpBugsFeatures(){
	new Ext.Window({
		title: 'Report Bugs/ Request Features',
		layout: 'fit',
		closable: true,
		closeAction: 'hide',
		maximizable: true,
		width: 500,
		height: 500,
		items: [{
			xtype: 'panel',
			autoScroll: true,
			html: '<b> Future Features </b> <br> 1. Integration with Catalog Services <br> 2. Advanced Layer Tree <br><br>  <br><br> Report a bug or request a feature:<br> <a href="mailto:jalisdairi@gmail.com?subject=WFSClient">Send Email</a>'
			}
		]
	}).show();	
}

// Help Menu Item - About this application
function HelpAbout(){
	new Ext.Window({
		title: 'About this Application',
		layout: 'fit',
		closable: true,
		closeAction: 'hide',
		maximizable: true,
		width: 500,
		height: 500,
		items: [{
			xtype: 'panel',
			autoScroll: true,
			html: 'Version 0.2 (23 August 2012) Updates:<br> 1. Added the ability to zoom to the active layer. <br> 2. Added the select box button to the toolbar so the ability to click and drag the map remains active unless the select box button is depressed. <br> 3. When the show popups button is undepressed all popups are cleared from the map display. <br>  <br> Version 0.1 (10 July 2012)<br> Initial Release<br> <br> This program was created by Jessica Good Alisdairi for the Arizona Geological Survey. It is still under development.<br><br>  This program uses OpenLayers, GeoExt and ExtJs.<br> <a href="http://openlayers.org/">OpenLayers</a><br> <a href="http://http://geoext.org/">GeoExt</a><br> <a href="http://dev.sencha.com/deploy/ext-3.4.0/">Ext JS</a><br>'
			}
		]
	}).show();	
}