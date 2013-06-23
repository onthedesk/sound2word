var preload;
var loadingProgress;
var event = { "loaded": 0 };
function OnEnterPreloadState() {
	controller.handlePreloadRequest();
	if ( !controller.isFinish )	{
		ptwUI.showLoadingUI();
		_hmt.push(['_trackPageview', '/preload']);
		controller.isPreloadTimeUp = false;
		loadingProgress = setInterval(fakeProgress, 500);
		controller.preloadTimer = setTimeout("preloadTimeUp()", controller.minPreloadTime);
	}
	
	controller.initSongPlayer();
	
}
function OnExitPreloadState()
{
	clearInterval(loadingProgress);
	clearTimeout(controller.preloadTimer);
	event.loaded = 0;
}
function preloadTimeUp() {
	controller.isPreloadTimeUp = true;
	if ( controller.isPreloadFinished ) {	
    	SM.SetStateByName("inGame");
    }
}
function preloadImages(questions) {
    for (var i = 0; i < questions.length; i = i + 1) {
    	var id = questions[i]["ID"];
    	var filename = controller.dataBaseUrl + "music/" + sprintf("__%05d.m4a", id);
    	var question = new Question(questions[i], filename );
    	ptwUI.addQuestion(question);
    }
}
function fakeProgress() {
    event.loaded += 500/controller.minPreloadTime;
    if (event.loaded > 0.99) {
        clearInterval(loadingProgress);
    }
    ptwUI.showLoadingUIProgress(event);
}
function handleProgress(event) {
    
    ptwUI.showLoadingUIProgress(event);
}

function handleComplete() 
{
	controller.isPreloadFinished = true;
	if ( controller.isPreloadTimeUp ) {	
    	SM.SetStateByName("inGame");
    }
}


var PreloadState = new State( OnEnterPreloadState, OnExitPreloadState );
