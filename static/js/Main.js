// Global Variables
var map;					// The map
var wfsLayers = [];  		// Array of WFS Layers
var l = 0;					// Variable to keep track of the number of layers added
var popup;					// The popup for the description of a feature
var showPopups = false;		// We don't want to show popups until user has clicked 'show popups' button
var activeLayer;			// Current active layer
var activeFeatures = [];	// Array of active features
var selFeatures = [];		// Array of selected features across all layers
var numOfAttributes;   		// Only needed for EXCEL - can delete
var layerAttributes;		// The attributes of the layer
var selectCtrl; 			// Control for the selection of individual features
var selectBoxCtrl;			// Control for the selection of mulitple features by drawing a box
var selectBox = false;		// The 'select box' is not initially pressed
var searchCatService;
var searchField = "AnyText";
var searchTerm = "";
var gridPanel;
var store;
var curRow = 0;				// Currently selected row in the csw grid
var cswResults;
var checkedLayers = [];		// Array of layers that are currently checked in the layer tree
var checkedFeatures = []; 	// Selected features in the checked layers
var useVisibleExtent = true;
var bounds;
var measureCtrl;
var hits;

// Projections
var wgs84 = new OpenLayers.Projection("EPSG:4326");
var googleMercator = new OpenLayers.Projection("EPSG:900913");

// Array to track of the colors used to display the features so there is no repetition
// Add black & the same yellow used for selected features to the list
var usedColors = ['#000000','#080000','#100000','#200000','#280000','#300000','#FFFF00','#FFFF33']; 

Ext.onReady(function() {
	// Initialize QuickTips for toolbar tips on mouseover
	Ext.QuickTips.init();
	
	// Set up the proxy
	OpenLayers.ProxyHost = "/proxy?url=";
	
	// Initialize the map
	map = new OpenLayers.Map('map', {
		// Add the map controls
		controls: [
			new OpenLayers.Control.Navigation(),	
			new OpenLayers.Control.PanPanel(),										// Create a control for panning the map in small steps
			new OpenLayers.Control.MousePosition({ displayProjection: wgs84 }),		// Display georgaphic coordinates of the mouse pointer
			new OpenLayers.Control.ScaleLine(),										// Create a scale line
			new OpenLayers.Control.OverviewMap({ maximized: true }) 				// Create an overview map
		]
	});
	
	// Use Google Maps as base layers
	var baseLayer = new OpenLayers.Layer.Google(
		"Google Hybrid",
		{type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20, isBaseLayer:true, displayInLayerSwitcher:true}
	);
	var baseLayer2 = new OpenLayers.Layer.Google(
		"Google Terrain",
		{type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 20, isBaseLayer:true, displayInLayerSwitcher:true}
	);
	var baseLayer3 = new OpenLayers.Layer.Google(
		"Google Streets",
		{type: google.maps.MapTypeId.STREETS, numZoomLevels: 20, isBaseLayer:true, displayInLayerSwitcher:true}
	);
	
	// Create a zoom slider bound to the map
    slider = new GeoExt.ZoomSlider({
        map: map,
        aggressive: true,                                                                                                                                                   
        width: 200,
        plugins: new GeoExt.ZoomSliderTip({
            template: "<div>Zoom Level: {zoom}</div>"
        })
    });
	
	// If the set extent toggle is on, update the bounds as the map is moved
	map.events.on({
		"moveend": function() {
			if (bounds != undefined)
				SetMapExtent();
		}
	});
	
	// Create a control for distance measurement
	CreateMeasurementCtrl();
	
	// Create an empty store since a search has not been performed yet
	var noData = [ ['No catalogs searched yet.'] ];
    var emptyStore = new Ext.data.ArrayStore({
        fields: [
           {name: 'title'}
        ]
    });
	emptyStore.loadData(noData);

	// The form to specify the search parameters
	var formPanel = new Ext.FormPanel({
		id: 'form-panel',
        region: 'north',
		height: 135,
		title: 'USGIN AASG Geothermal Data',
		hideLabels: true,
		items: [Search()],
		buttons: [{ 
			text: 'Search', 
			listeners: {
				click: function(node,e){
					DoSearch();
				}
			}
		}]
	});

	// The grid which will contain the results of the csw search
	gridPanel = new Ext.grid.GridPanel({
		id: 'grid-panel',
		region: 'north',
        store: emptyStore,
        columns: [
            {id: 'title', header: "Title", dataIndex: "title", sortable: true}
        ],
        autoExpandColumn: 'title',
		frame: false,
		hideHeaders: true,
        height: 120,
		listeners: {
			// Set curRow to the clicked row
			rowclick: function (grid, row, e) {
				curRow = row;
			},
			// Show a qtip for each row on mouseover which displays the title and abstract for the record
			mouseover: function(e, cell) {
				var rowIndex = this.getView().findRowIndex(cell);
				if(!(rowIndex === false) && !(store == undefined) && !(store.data.length == 0)) {
					var record = store.getAt(rowIndex);
					var msg = "<b>" + record.data.title + "</b><br>" + record.data.abstract;
					Ext.QuickTips.register({
						text     : msg,
						target   : e.target
					});
				};
			},
			// Close the qtip on mouseout
			mouseout: function(e, cell) {
				Ext.QuickTips.unregister(e.target);
			}
		}
	});
	
	// The search panel which contains the form and the grid
    var searchPanel = new Ext.Panel({
		id: 'search-panel',
        title: 'Catalog Search',
        region: 'north',
		width: 205,
		height: 320,
		autoScroll: true,
		collapsible: true,
		collapsed: false,
		split: true,
		frame:true,
		items: [formPanel, gridPanel],
		bbar: CreateSearchBBar()
	});
   
	// The Tree Panel
	var treePanel = new Ext.tree.TreePanel({
		title: "Layers",
		region:'center',
		xtype: "treepanel",
		autoScroll: true,
		split: true,
		enableDD: true,
		collapsible: true,
		rootVisible: false,
		plugins: new Ext.ux.DataTip({
            tpl: '<div class="whatever">{name}</div>'
        }),
		root: new GeoExt.tree.LayerContainer({
			text: 'Map Layers',
			expanded: true
		}),
		listeners: {
			// When a layer is clicked
			click: function(node, e) {
				SetActive(node);
			},
			// When a layer is checked or unchecked
			checkchange: function(node, e) {
				if (node.layer.isBaseLayer == false) {
					if (e == true)
						LayerChecked(node);
					else
						LayerUnchecked(node);
				}
			}
		},
		tbar: CreateDataServicesToolbar(),
		bbar: CreateStatusbar()
	});
 
	// Create the Viewport with a map panel, a search panel, a tree panel and a legend panel
    var app = new Ext.Viewport({
        layout: "border",
        items: [{
			// The Map Panel
            region: "center",
            id: "mappanel",
            title: "Map Viewer",
            xtype: "gx_mappanel",
            map: map,
			layers: [baseLayer, baseLayer2, baseLayer3],
			// Transform the coordinates to Google Web Mercator to center map on US
			center: new OpenLayers.LonLat(-98.583, 39.833).transform(wgs84, googleMercator), 
			zoom: 5,
            split: true,
			margins: '2 0 0 0',
			tbar: CreateToolbar(),
			items: [{
				xtype: "gx_zoomslider",
				vertical: true,
				height: 100,
				x: 12,
				y: 80,
				plugins: new GeoExt.ZoomSliderTip()
			}]
		}, {	
			// The West Panel, composed of the Search Panel & the Tree Panel
            region: "west",
            id: 'layout-browser',
			title: 'NGDS Data Portal & Map Viewer',
			layout: 'border',
			//layout: 'anchor',
	        border: false,
	        split:true,
			collapsible: true,
			margins: '2 0 5 5',
	        width: 205,
			items: [searchPanel, treePanel]
		},{
			// The Legend Panel
			xtype: "gx_legendpanel",
			region: "east",
			title: "Legend",
			margins: '2 0 0 0',
			width: 205,
			autoScroll: true,
			padding: 5,
			collapsed: true,
			collapsible: true
        }]
    });	
 });

// Set the map extent
function SetMapExtent() {
	map.getExtent();
	var curBounds = map.getExtent();
	bounds = curBounds.transform(googleMercator, wgs84);
 }
 
// Check if the object is in the array
function IsIn(arr, obj){
	for(var i=0; i < arr.length; i++) {
		if (arr[i] == obj) 
			return true;
	}
}

// Create the control for the measurement tool
function CreateMeasurementCtrl() {
	var sketchSymbolizers = {
		"Point": {
			pointRadius: 4,
			graphicName: "square",
			fillColor: "white",
			fillOpacity: 1,
			strokeWidth: 1,
			strokeOpacity: 1,
			strokeColor: "#333333"
		},
		"Line": {
			strokeWidth: 3,
			strokeOpacity: 1,
			strokeColor: "#666666",
			strokeDashstyle: "dash"
		}
	};
	var style = new OpenLayers.Style();
	style.addRules([
		new OpenLayers.Rule({symbolizer: sketchSymbolizers})
	]);
	var styleMap = new OpenLayers.StyleMap({"default": style})

	measureCtrl = new OpenLayers.Control.Measure(
		OpenLayers.Handler.Path, {
			persist: true,
			handlerOptions: {
				layerOptions: {styleMap: styleMap}
			}
		}
	);
	
	measureCtrl.events.on({
		"measure": handleMeasurements,
		//"measurepartial": handleMeasurements
	});
	map.addControl(measureCtrl);
}

function handleMeasurements(event) {
	var geometry = event.geometry;
	var units = event.units;
	var measure = event.measure;
	if (measure.toFixed(3) != 0.000) {
		var output  = "Distance = " + measure.toFixed(3) + " " + units;
		//CreateMeaurementPopup(output);
		alert("Distance = " + measure.toFixed(3) + " " + units);
		}
}

// Set checkedLayers and checkedFeatures for checked layer
// If checked layer is the active layer, set the active features
function LayerChecked(node) {
	// Add the checked layer to the checkedLayers array
	checkedLayers.push(node.layer);
	
	// Add the selected features on the checked layer to the checkedFeatures array
	for (var i=0; i < selFeatures.length; i++) {
		if (selFeatures[i].layer.name == node.layer.name)
			checkedFeatures.push(selFeatures[i]);
	}
	
	// If no active layer has been set yet, set the checked layer as the active layer
	if (activeLayer == undefined) {
		node.select();
		SetActive(node);
	}
	
	// If the checked layer is the same as the active layer set the active features
	if (activeLayer != undefined) {
		if (node.layer.name == activeLayer.name)	
			SetActive(node);
	}
}

// If a layer has been unchecked, remove that layer from checkedLayers and
// remove that layer's selected features from checkedFeatures
function LayerUnchecked(node) {
	checkedLayers.splice(checkedLayers.indexOf(node.layer), 1);
	for (var i=0; i < checkedFeatures.length; i++) {
		if (checkedFeatures[i].layer.name == node.layer.name) {
			checkedFeatures.splice(i, 1);
			i--;
		}
	}
}