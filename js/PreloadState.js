var preload;
function OnEnterPreloadState() {
	controller.handlePreloadRequest();
	if ( !controller.isFinish )	{
		ptwUI.showLoadingUI();
		_hmt.push(['_trackPageview', '/preload']);
		controller.isPreloadFinished = true;
		controller.isPreloadTimeUp = false;
		controller.preloadTimer = setTimeout("preloadTimeUp()", controller.minPreloadTime);
	}
}

function OnExitPreloadState()
{
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
