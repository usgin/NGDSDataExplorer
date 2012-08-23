// Global Variables
var map;				// The map
var polyLayer;			// User-drawn polygon
var wfsLayers = [];  	// Array of WFS Layers
var j = 0;				// Variable to keep track of the number of layers added
var popup;				// The popup for the description of a feature
var showPopups = false;	// We don't want to show popups until user has clicked 'show popups' button
var activeLayer;		// Current active layer
var activeFeatures = [];// Array of active features
var selFeatures = [];	// Array of selected features across all layers
var numOfAttributes;   	// Only needed for EXCEL - can delete
var layerAttributes;	// The attributes of the layer
var usedUrls = [];		// Array of base Urls that have been used already
var selectCtrl; 		// Control for the selection of individual features
var selectBoxCtrl;		// Control for the selection of mulitple features by drawing a box
var selectBox = false;	// The 'select box' is not initially pressed

// Projections
var wgs84 = new OpenLayers.Projection("EPSG:4326");
var googleMercator = new OpenLayers.Projection("EPSG:900913");

// Array to track of the colors used to display the features so there is no repetition
// Add black & the same yellow used for selected features to the list
var usedColors = ['#000000','#080000','#100000','#200000','#280000','#300000','#FFFF00','#FFFF33']; 

Ext.onReady(function() {
	// Initialize QuickTips for toolbar tips on mouseover
	Ext.QuickTips.init();
	
	// Initialize the map          
	map = new OpenLayers.Map('map');
	
	// Add controls for the map
	map.addControl(new OpenLayers.Control.Navigation());
	map.addControl(new OpenLayers.Control.PanPanel());
	map.addControl(new OpenLayers.Control.ZoomPanel());
	
	// Use Google Maps as the base layer
	var baseLayer = new OpenLayers.Layer.Google(
		"Google Hybrid",
		{type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20, isBaseLayer:true}
	);
	
	// A layer for a user-drawn polygon
	//polyLayer = new OpenLayers.Layer.Vector("polyLayer");
 
	// Create the Viewport with a map panel, a tree panel and a legend panel
    var app = new Ext.Viewport({
        layout: "border",
        items: [{
			// The Map Panel
            region: "center",
            id: "mappanel",
            title: "WFS Map",
            xtype: "gx_mappanel",
            map: map,
			layers: [baseLayer],
            //layers: [baseLayer, polyLayer],
			// Transform the coordinates to Google Web Mercator to center map on US
			center: new OpenLayers.LonLat(-98.583, 39.833).transform(wgs84, googleMercator), 
			zoom: 5,
            split: true,
			tbar: CreateToolbar()
		}, {	
			// The Tree Panel
            region: "west",
            title: "Available Layers",
			xtype: "treepanel",
            width: 200,
			autoScroll: true,
            split: true,
			enableDD: true,
			collapsible: true,
			rootVisible: true,
			root: new GeoExt.tree.LayerContainer({
				text: 'Map Layers',
				expanded: true
			}),
			listeners: {
				// When a layer is clicked set that as the active layer and set the active features
				click: function(node, e) {
					SetActive(node);
				},
				// When a layer is checked, if that is the active layer, set the active features
				checkchange: function(node, e) {
					if (e == true && activeLayer != undefined) {
						//console.log(node);
						//console.log(activeLayer);
						if (node.layer.name == activeLayer.name)	
							SetActive(node);
					}
				}
			},
			tbar: CreateDataServicesToolbar(),
			bbar: CreateStatusbar()
		},{
			// The Legend Panel
			xtype: "gx_legendpanel",
			region: "east",
			title: "Legend",
			width: 200,
			autoScroll: true,
			padding: 5,
			collapsed: true,
			collapsible: true
        }]
    });
 });

// Check if the object is in the array
function IsIn(arr, obj){
	for(var i=0; i<arr.length; i++) {
		if (arr[i] == obj) 
			return true;
	}
}
