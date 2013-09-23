/*************************************************************************************************************************************************
/	Set the Style for Features
/************************************************************************************************************************************************/

// Specify the style options for the features
function SetStyle(){
	
	var sketchSymbolizers = {
        "Point": {
            pointRadius: 4.5,
            //externalGraphic: 'static/images/metadata-icon.png',
            // graphicName: "square",
            fillColor: GetRandomColor(),
            fillOpacity: 1,
            strokeWidth: 1,
            strokeOpacity: 1,
            strokeColor: "#333333"
        },
        "Line": {
            strokeWidth: 3,
            strokeOpacity: 1,
            strokeColor: "#8B4513", // SaddleBrown
            // strokeDashstyle: "dash"
        },
        "Polygon": {
            strokeWidth: 2,
            strokeOpacity: 1,
            strokeColor: "#666666",
            fillColor: GetRandomColor(),
            fillOpacity: 0.3
        }
    };
            
	var defaultStyle = new OpenLayers.Style({});
		
	var selectStyle = new OpenLayers.Style({
		fillColor: "yellow",
		strokeColor: "red",
		fillOpacity: 0.6,
		strokeWidth: 2		
	});

	var style = new OpenLayers.StyleMap({
           'default': defaultStyle,
           'select': selectStyle
        });
		
	var context = {
		getNum: function(feature) {
			return feature.features.length;
		}
	};
	
	style.styles['default'].addRules([
		new OpenLayers.Rule({
			title: "${title}",
			symbolizer: sketchSymbolizers
        })
	]);
	return style;
}

// Get a unique random color in Hex format		
function GetRandomColor(){
	var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    
    return color;
}