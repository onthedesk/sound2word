
function OnEnterInGameState() {
    ptwUI.showInGameUI();
    ptwUI.showCurrentQuestion();
	//register key functions
    $('.question-key').on(ptwUI.touchEnd,function (e) {
        var emptyKeys = $(this).parents(".question").find(".answer-key[data-key='']");
        var emptyKeysCount = emptyKeys.length;
        if (emptyKeysCount > 0) {
            ptwUI.appendCharactor($(emptyKeys[0]), $(this));
            emptyKeysCount = emptyKeysCount - 1;
            if (emptyKeysCount == 0) {
                if (controller.isAnswerCorrect()) {
                	controller.handleAnswerCorrect();
                }
                else {
                    ptwUI.onFailed();
                }
            }
        }
    });

    $(".answer-key").on(ptwUI.touchEnd,function (e) {
        var data_key = $(this).attr("data-key");
        if (data_key != null && data_key != '') {
            ptwUI.removeCharactor($(this));
        }
        if ( $(this).hasClass('error') ) {
	        $(this).siblings().attr('class','answer-key');
        }
    });
    
    $("audio")[0].play();
	//controller.startGame();
	_hmt.push(['_trackPageview', '/ingame']);
}

function OnExitInGameState()
{
	document.onkeydown = null;
	document.onkeyup = null;
	controller.stopGame();
}


var InGameState = new State( OnEnterInGameState, OnExitInGameState );

