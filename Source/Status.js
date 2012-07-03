// Display the status of the application

// Create the statusbar for displaying Ready or Loading
function CreateStatusbar(){
	var statusbar = [{
				xtype: 'tbtext', 
				id: 'statusbar', 
				text: 'Ready'
			}]; 
	return  statusbar;
}

// Set cursor to wait and statusbar to loading
function Busy(name){
	document.body.style.cursor = 'wait';
	// Set the status bar to show that something is processing:
	var sb = Ext.getCmp('statusbar');
	sb.setText("Loading "+name+" ...");
}

// Set cursor to default and statusbar to ready
function Ready(){
	document.body.style.cursor = 'default';
	var sb = Ext.getCmp('statusbar');
	sb.setText("Ready");
}