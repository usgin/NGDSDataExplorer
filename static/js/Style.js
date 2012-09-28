// Set the style for the feature points
function SetStyle(){

	var defaultStyle = new OpenLayers.Style({});
		
	var selectStyle = new OpenLayers.Style({
		fillColor: "yellow",
		strokeColor: "red"
	});

	var style = new OpenLayers.StyleMap({
            'default': defaultStyle,
            'select': selectStyle
        });
		      var context = {
                getNum: function(feature) {
                    //console.log(feature);
                    return feature.features.length;
                }
            };
	
	style.styles['default'].addRules([
		new OpenLayers.Rule({
			title: "${title}",
            symbolizer: {
				pointRadius: 5,
				fillColor: GetRandomColor(),
				strokeWidth: .5 
			}
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
	
	// Check to see if the color has already been used and if not add the color to the usedColors array
	if (IsIn(usedColors, color))
		GetRandomColor();
	else
		usedColors.push(color);

    return color;
}
