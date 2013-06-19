var GameCookieKey = "pic2wordkey";
var LevelsCookieKey = "pic2wordlevels";


function Controller() {
	//questions
    this.currentQuestionId;
    this.currentQuestionIndex;
    this.currentQuestionLevel = 1;
    this.questions = [];
    this.questionRepo = [];
    this.questionRepoSize = 1;
    this.currentQuestionBatch = 1;
    this.isFinish = false;
    
    //preload
    this.minPreloadTime = 2000;
    this.isPreloadFinished = false;
    this.isPreloadTimeUp = false;
    this.preloadTimer;
    //data url
    this.dataBaseUrl = "data/";
    
    this.loadCharactors();
    
}

Controller.currentQuestionId;
Controller.questionRepo;
Controller.currentQuestionBatch;
Controller.charactors;
Controller.needPreload;

Controller.prototype.startGame = function () {
	this.getQuestionId();
    this.initBaseOnUrl();
}

Controller.prototype.stopGame = function()
{
}

Controller.prototype.loadCharactors = function () {
    var that = this;
    $.getJSON("data/charactors.json", function (data) {
        that.charactors = data["charactors"];
    });
}

Controller.prototype.getQuestionId = function() {
	var id = getURLParameter('id');
	if ( id != null && id != "" ) {
		this.currentQuestionIndex = parseInt(id);
	} else {
		this.currentQuestionIndex = 0;
	}
	
}

Controller.prototype.initBaseOnUrl = function() {
	var date = getURLParameter('date');
    if ( date != null && date != "" ) {
	    this.dataBaseUrl = "data/" + date + "/";
	    this.currentQuestionId = 0;
    }
}
Controller.prototype.loadAllQuestions = function () {
    var that = this;
    $.getJSON( this.dataBaseUrl + "questions.json", function(data) {
    	that.questions = data["questions"];
    	that.loadCurrentQuestions();
    });
}

Controller.prototype.loadCurrentQuestions = function() {
	this.questionRepo = [];
	this.questionRepo.push(this.questions[ this.currentQuestionIndex ]);
	this.currentQuestionId = this.questions[ this.currentQuestionIndex ]['ID'];
    preloadImages(this.questionRepo);
}

Controller.prototype.handleAnswerCorrect = function() {
	SM.SetStateByName('finish');
}
Controller.prototype.isAnswerCorrect = function () {
    var answerText = '';
    $(sprintf("#question-%d .answer-key", this.currentQuestionId)).filter(function () {
        return $(this).attr("data-key") != "";
    }).each(function (index, elem) {
        answerText += elem.getAttribute("data-key");
    });
    return this.isAnswerCorrectByText(answerText);
}

Controller.prototype.isAnswerCorrectByText = function (answerText) {
    if (this.questionRepo[this.currentQuestionIndex]["answer"] == answerText) {
        return true;
    }
    return false;
}


Controller.prototype.removeLetters = function () {
}

Controller.prototype.update = function () {
    
}