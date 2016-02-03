var widgetAPI = new Common.API.Widget();
var tvKey = new Common.API.TVKeyValue();

var Main = 
{
}

Main.onLoad = function()
{	
    // Set Default key handler function
	widgetAPI.sendReadyEvent();
	
}
var networkPlugin  = document.getElementById('pluginObjectNetwork');
var internetConnectionInterval = 10000; 

function ConnectionError(){
	alert ("ConnectionError");
	
	firstTime = false;
	loaded = false;
	i = 11;
	var errorTimer = setInterval(function() {
		news.ui.nav("exit");
		i --;
		$("#error-message").html("<p>Error de conexión debido a problemas en la red<br>Reconectando en: " + i + "</p>").show();
		if (i == 0){
			alert ("reload");
			$("#error-message").hide();
			clearInterval(errorTimer);
			news.Reader.load("RSS", false);
		}

	}, 1000);

	$("#feed-list a").eq(0).focus();
	//clearInterval(timeConnection)
}

function cyclicInternetConnectionCheck() {
	alert ("cyclicInternetConnectionCheck");
	if(!checkConnection() ){
		// no internet connection
		ConnectionError();
	} 
	
}

var timeConnection =  setInterval(function(){cyclicInternetConnectionCheck()}, internetConnectionInterval);

function checkConnection() {
	alert ("checkConnection");
	
	var physicalConnection = 0,
	httpStatus = 0;

	// Get active connection type - wired or wireless.
	currentInterface = networkPlugin.GetActiveType();

	// If no active connection.
	if (currentInterface === -1) {
			return false;
	}

	// Check physical connection of current interface.
	physicalConnection = networkPlugin.CheckPhysicalConnection(currentInterface);

	// If not connected or error.
	if (physicalConnection !== 1) {
			return false;
	}

	// Check HTTP transport.
	httpStatus = networkPlugin.CheckHTTP(currentInterface);

	// If HTTP is not avaliable.
	if (httpStatus !== 1) {
			return false;
	}

	// Everything went OK.
	return true;
}
