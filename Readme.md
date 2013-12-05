# NGDS Data Explorer

The National Geothermal Data System (NGDS) Data Explorer was developed to be a lightweight, open-source, publicly-accessible web mapping application which facilitates the discovery of geothermal features without the need to switch between multiple interfaces. An integrated searchof the U.S. Geoscience Information Network (USGIN) Association of American State Geologists (AASG) Geothermal Data Catalog will list relevant web feature services available for attribute querying and display on a map. The search can be limited to a specific geographical extent for further refinement. Once added to the map, attributes for features can either be shown in a feature popup or a table. Users can also select features from different data services for display in a single table. The NGDS Data Explorer is primarily for geologists and other researchers needing a quick and easy way to retrieve information about U.S. geothermal features without the need for software beyond a web browser or the knowledge of who hosts which services. To be accessed at http://data.geothermaldatasystem.org/.

Developed in 2012 by Jessica Good Alisdairi at the Arizona Geological Survey. 
Utilizes OpenLayers v2.13.1, GeoExt v1.1 and ExtJs v3.4.

## Setting up the Development Environment:

### In Windows:

* Get the code

```git clone git@github.com:usgin/NGDSDataExplorer
```	

* Install node.js from http://nodejs.org

* Open the Windows command prompt in the NGDSDataExplorer folder created above
* Install the necessary modules:

```NGDSDataExplorer> npm install express
NGDSDDataExplorer> npm install jade
NGDSDataExplorer> npm install -g coffee-script
NGDSDataExplorer> npm install request
```

* Start the application:

```NGDSDataExplorer> coffee app.coffee
```

The local site can be accessed at [http://localhost:3000/](http://localhost:3000/).