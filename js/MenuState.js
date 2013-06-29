function OnEnterMenuState() {
    // display different ui for preview version and single question version
    if (controller.isSingleQuestionMode && controller.singleQuestionId != "") {
        ptwUI.showMenuUI();
    }
    else {
        ptwUI.showMenuUIForFullGame();
    }
    initMenu();
	_hmt.push(['_trackPageview', '/start']);
}

function OnExitMenuState()
{
}

function initMenu() {

    var menuStart = $("#start-btnPlay");
    menuStart.click(function (evt) {
        SM.SetStateByName("preload");
    });
}

var MenuState = new State( OnEnterMenuState, OnExitMenuState );

