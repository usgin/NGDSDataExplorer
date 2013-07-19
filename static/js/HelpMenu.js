/*************************************************************************************************************************************************
/	Help Menu
/	Create the Help Menu, located on the right side of the Map Panel Toolbar
/ 	The Help Menu has the following components:
/		- Help Using the Application
/		- Report Bugs/ Request Features
/		- About this application
/************************************************************************************************************************************************/

// Help Menu Item - Help using this application
function HelpUsingApp(){
	if (!winHelpUsingApp) {
		var winHelpUsingApp = new Ext.Window({
			title: 'Using the Application',
			layout: 'fit',
			closable: true,
			closeAction: 'hide',
			maximizable: true,
			width: 800,
			height: 500,
			items: [{
				xtype: 'panel',
				autoScroll: true,
				html: '<html> <b>National Geothermal Data System (NGDS) Data Explorer</b><br><br> This program searches the AASG Geothermal Data Catalog for U.S. geothermal features based on a keyword and/or defined map extent. It then displays the features on a map, allows for the selection of features, and can create a table of selected features.<br><br>  This program contains the following parts:<br> 1. <b>Search Catalog Panel</b><br> - Search Form<br> - Results Grid<br> 2. <b>Layers Panel</b><br>new AND hampshire - Data Services Toolbar<br> - Layers List<br> 3. <b>Map View Panel</b><br> - Toolbar<br> - Map Viewer<br> 4. <b>Legend Panel</b><br><br>  <b>1. Search Catalog Panel</b><br> The Catalog Search allows for the search of the AASG Geothermal Data Catalog for features which can be mapped and queried. Select the type of search to be performed from the drop-down menu. Enter the search term(s) in the input box. If more than one word is typed in the input box then the AND condition is assumed and every word must be in the result. To specifiy an OR condition type the word OR between words such as \'fault OR spring.\' Check or uncheck the box depending on whether or not the search should only look for data services containing features within the current map extent. Mouseover an item in the resulting list to see a pop-up with more information about the data service. To add the layer(s) from that data service, double-click the data service or click on the data service and then click the Add Layer button below the list. <br><br>  <b>2. Layers Panel</b><br> The Layers Panel lists the layers that are available to be shown in the map. Check or uncheck the box next to the layer name to turn the layer on and off. Drag and drop the layer names to change the order of the layers. Click on the name of a layer to highlight the layer in blue and set that layer as the active layer. The Layer Tree panel can be expanded or collapsed by clicking on the arrows. Right click on a layer to have the options to (a) zoom to the extent of that layer, (b) see the metadata for that layer and (c) remove that layer from the list of layers. At the bottom is a status bar which indicates if a layer is currently loading. <br><br>  The Data Service Toolbar allows for the selection of data services to retrieve. There are two options for specifying the location of a desired data service.<br> 1. The Quick-Pick Data Service Drop-down Menu - Select a data service from the drop-down menu and its layers will be added to the layer tree.<br> 2. Base Url Input - Click the button to the right of the data service drop-down menu. Input a base url as in the example. Press enter. Layers will be added to the tree.<br><br>   <b>3. The Map Panel</b><br> The Map Panel displays the locations of the features in the checked layer(s). The Map Panel has the following capabilities:<br> <b>Adjust Zoom</b>: Use the slider in the top left corner of the map or double-click on an area to zoom in. Alternatively, hold down the Shift key and draw a box to zoom in.<br> <b>Pan</b>: Click on the up/down, left/right buttons in the top left corner. Alternatively, as long as the select box button is not depressed, click the map and drag.<br> <b>Scale Bar</b>: In the bottom left of the map is a scale bar with measurements in both imperial and metric units.<br> <b>Overview Map</b>: At the bottom right of the map is a collapsible insert with an overview map showing a red box indicating the current extent of the main map.<br> <b>Select Feature(s)</b>: Click on a feature to select it. It will turn yellow. Alternatively, depress the select box button on the toolbar to select multiple features by drawing a box.<br> <b>Unselect Feature(s)</b>: Click on a feature to unselect it. Alternatively, click on the clear selected button in the toolbar to unslected all features.<br><br>  The Map Panel Toolbar provides additonal functionality for the the Map Panel. It has the following capabilities:<br> <b>zoom extent</b>: Zoom to the maximum extent of all loaded layers.<br> <b>previous/next</b>: Navigate through the history of map views.<br> <b>set extent</b>: Depress to set the working extent of the map to the current view. Any new data services selected will only retrieve features within that extent.<br> <b>select box</b>: Draw a box to select multiple features. <br> <b>clear selected</b>: Unselect all selected features.<br> <b>show popups</b>: When depressed, clicking on a feature will bring up a popup with information about that feature. Close the popup window by clicking the feature again or by clicking the x in the corner of the popup window. Close all open popups by undepressing the show popups toggle button.<br> <b>measure</b>: Click on the map to start a distance measurement. Double-click to finish the measurement and get a popup with the straight-line distance in metric units.<br> <b>wfs url</b>: Get the URL of the WFS for the highlighted layer.<br> <b>create table</b>: Create a table in another browser window containing the data for the selected features in the checked layer(s).<br> <b>create csv</b>: Download a CSV containing the attribute data for the selected features in the checked layer(s).<br><br>   <b>6. The Legend</b><br> The Legend panel is a collapsible panel to the right of the Map panel. The legend can be expanded or collapsed by clicking on the double arrow button. An entry indicating the number of features loaded for that layer is given below the title, alongside any symbols used to represent features in the layer. The legend will open automatically when the first layer is added to the map and will close automatically when the last checked layer is unchecked.'
				}],
			buttons: [{
	            text: 'Close',
	                handler: function () {
	                    winHelpUsingApp.hide()
	                }
	        	}]
			});
		}
	winHelpUsingApp.show();	
}

// Help Menu Item - Report Bugs/Request Features 
function HelpBugsFeatures(){
	if (!winHelpBugsFeatures) {
		var winHelpBugsFeatures = new Ext.Window({
			title: 'Report Bugs/Request Features',
			layout: 'fit',
			closable: true,
			closeAction: 'hide',
			maximizable: true,
			width: 800,
			height: 500,
			items: [{
				xtype: 'panel',
				autoScroll: true,
				html: 'Report a bug or request a feature:<br> If reporting a bug, a detailed list of the steps that caused the bug would be most helpful.<br><br><a href="mailto:jessica.alisdairi@azgs.az.gov?subject=WFSClient">Send Email</a>'
				}],
			buttons: [{
	            text: 'Close',
	                handler: function () {
	                    winHelpBugsFeatures.hide()
	                }
	        	}]
		});
	}
	winHelpBugsFeatures.show();
}

// Help Menu Item - About this application
function HelpAbout(){
	if (!winHelpAbout) {
		var winHelpAbout = new Ext.Window({
			title: 'About this Application',
			layout: 'fit',
			closable: true,
			closeAction: 'hide',
			maximizable: true,
			width: 800,
			height: 500,
			items: [{
				xtype: 'panel',
				autoScroll: true,
				html: 'This program was created by Jessica Good Alisdairi for the Arizona Geological Survey (AZGS), the US Geoscience Information Network (USGIN) and the National Geothermal Data System (NGDS).<br><br>  This program uses OpenLayers, GeoExt and ExtJs.<br> <a href="http://openlayers.org/">OpenLayers</a><br> <a href="http://http://geoext.org/">GeoExt</a><br> <a href="http://dev.sencha.com/deploy/ext-3.4.0/">Ext JS</a>'
				}],
			buttons: [{
	            text: 'Close',
	                handler: function () {
	                    winHelpAbout.hide()
	                }
	        	}]
		});
	}
	winHelpAbout.show();	
}