var GameCookieKey = "sound2wordkey";
var LevelsCookieKey = "sound2wordlevels";


function Controller() {
	//questions
    this.currentQuestionId;
    this.currentQuestionLevel = 1;
    this.currentQuestionIndex;
    this.nextQuestionLevel;
    this.questions = [];
    this.questionLevels = [];
    this.questionRepo = [];
    this.questionRepoSize = 10;
    this.currentQuestionBatch = 1;
    this.isFinish = false;
    this.difficultyBoundary = 30;
    
    this.isSingleQuestionMode = false;
    this.singleQuestionId = "";
    
    //cookie related
    this.forceFromCurrent = false;
    this.isAllowCookie = true;
    this.readLevelsFromCookie = false;
    
    //preload
    this.minPreloadTime = 2500;
    this.isPreloadFinished = false;//for fake progress
    this.isPreloadTimeUp = false;
    this.preloadTimer;
    //data url
    this.dataBaseUrl = "data/";
    
    //song player
    this.songPlayer;
    this.isSongPlayerReady = false;
    
    this.loadCharactors();
    this.preloadInGameUIImages();
    
}

Controller.currentQuestionId;
Controller.questionRepo;
Controller.currentQuestionBatch;
Controller.charactors;
Controller.needPreload;

Controller.prototype.startGame = function () {
    this.getQuestionId();
    this.getQuestionDate();
    
    if ( ! this.isSingleQuestionMode ) {
	    if (readCookie(GameCookieKey) != null) {
	        this.loadFromCookie();
	    }
	    if (readCookie(LevelsCookieKey) != null) {
		    this.loadLevelsFromCookie();
	    } 
    }
}

Controller.prototype.getQuestionDate = function() {
	var date = getURLParameter('date');
    if ( date != null && date != "" ) {
	    this.dataBaseUrl = "data/" + date + "/";
	    this.enableSingleQuestionMode();
    }
}

Controller.prototype.getQuestionId = function () {
    var id = getURLParameter('id');
    var date = getURLParameter('date');
    if (id != null && id != "") {
        if (date == null || date == "") { // if date and id both get set, we would take questions from date. 
            this.singleQuestionId = id;
        }
        this.enableSingleQuestionMode();
    }
}

Controller.prototype.enableSingleQuestionMode = function () {
    this.forceFromCurrent = false;
    this.readLevelsFromCookie = false;
    this.isAllowCookie = false;
    this.currentQuestionBatch = 1;
    this.currentQuestionId = '__00000';
    this.currentQuestionIndex = 0;
    this.currentQuestionLevel = 1;
    this.questionRepoSize = 1;
    this.isSingleQuestionMode = true;
}
Controller.prototype.loadFromCookie = function () {
    var controllerData = readCookie(GameCookieKey);
    var values = controllerData.split(',');
    this.currentQuestionLevel = parseInt(values[0]);
    this.currentQuestionIndex = parseInt(values[1]);
    this.currentQuestionBatch = parseInt(values[2]);
    this.nextQuestionLevel =  parseInt(values[3]);
    this.forceFromCurrent = true;
}
Controller.prototype.saveInCookie = function () {
	if ( this.isAllowCookie ) {
		createCookie( GameCookieKey, this.currentQuestionLevel + "," + this.currentQuestionIndex + "," + this.currentQuestionBatch + "," + this.nextQuestionLevel, 1000);
	}
}
Controller.prototype.loadLevelsFromCookie = function() {
	var controllerData = readCookie(LevelsCookieKey);
	this.questionLevels = controllerData.split(',');
	this.readLevelsFromCookie = true;
}
Controller.prototype.saveLevelsInCookie = function() {
	if ( this.isAllowCookie ) {
		createCookie( LevelsCookieKey, this.questionLevels.join(','));
	}
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


Controller.prototype.handlePreloadRequest = function() {
	
	if ( this.isSongPlayerReady ) {
		this.beginLoadQuestions();
	} else {
		this.initSongPlayer();
	}
	
	
}
Controller.prototype.beginLoadQuestions = function() {
	if ( this.questions.length < 1 ) {
	    this.loadAllQuestions();
    } else {
	    this.loadCurrentQuestions();
    }
}
Controller.prototype.loadAllQuestions = function () {
    var that = this;
    var filename = "questions.json";

    if (this.isSingleQuestionMode && this.singleQuestionId != "") {
        filename = "questions_full.json";
    }
    $.getJSON( this.dataBaseUrl + filename, function (data) {
            that.questions = data["questions"];
            if (data["questionRepoSize"]) {
                that.questionRepoSize = data["questionRepoSize"];
            }
            that.generateLevels();
            that.loadCurrentQuestions();
    }).fail(function () {
    		if ( that.isSingleQuestionMode ) {
	    		that.dataBaseUrl = "data/";
	            that.singleQuestionId = "";
	            that.loadAllQuestions();
	            
    		} else {
    			that.isPreloadFinished = false;
	    		alert("很抱歉，找不到题库！请和管理员联系");
    		}
    		
            
    });
    
}

Controller.prototype.generateLevels = function() {
	if ( this.readLevelsFromCookie && this.questionLevels.length == this.questions.length) {
		return;
	}
	var array = [], length = this.questions.length, difficultyBoundary = this.difficultyBoundary,  i;
	this.questionLevels = [];
	for ( i = 0 ; i < Math.min( difficultyBoundary, length ); i ++ ) {
		array.push(i);
	}
	$.merge(this.questionLevels, shuffleArray(array) );	

	if ( length > difficultyBoundary ) {
		for ( i = difficultyBoundary, array = []; i < length; i ++ ) {
			array.push(i);
		}
		$.merge(this.questionLevels, shuffleArray(array) );
	}
	this.saveLevelsInCookie();
	
}
Controller.prototype.loadSingleQuestion = function() {
	this.questionRepo = [];
	var index = this.questions.indexOfId( this.singleQuestionId );
 	if ( this.singleQuestionId != "" && index > 0 ) {
	 		this.questionRepo.push( this.questions[index] );
	 		this.currentQuestionId = this.singleQuestionId;
 	} else {
	 		this.questionRepo.push( this.questions[0] );
	 		this.currentQuestionId = this.questions[0]['ID'];
 	}
}
Controller.prototype.loadCurrentQuestions = function () {
    if (this.isSingleQuestionMode) {
        this.loadSingleQuestion();
        
        preloadImages(this.questionRepo);
        return;
    }
    var start, end, repoLevels = [], that = this;
    start = (this.currentQuestionBatch - 1) * this.questionRepoSize;
    end = Math.min(this.questions.length, start + this.questionRepoSize);

    if (!(start < end)) {
        //no more questions
        this.saveInCookie();
        controller.isFinish = true;
        SM.SetStateByName('finish');
        return;
    }
    this.questionRepo = [];
    repoLevels = this.questionLevels.slice(start, end);
    repoLevels.forEach(function (value, index) {
        that.questionRepo.push(that.questions[value]);
    });
    if (this.forceFromCurrent == false) {
        this.currentQuestionIndex = 0;
        this.currentQuestionLevel = 1;
        this.nextQuestionLevel = this.currentQuestionLevel + 1;
    }
    this.currentQuestionId = this.questionRepo[this.currentQuestionIndex]["ID"];
    this.saveInCookie();


    preloadImages(this.questionRepo);
}
Controller.prototype.setCurrentSongUrl = function() {
	
	var url = "http://" + window.location.host + window.location.pathname;
	url = url.substring(0, url.lastIndexOf('/') + 1);
	var m4aUrl = url + controller.dataBaseUrl + "music/" + 'm4a/' + sprintf("%s.m4a", this.currentQuestionId);
	var oggUrl = url + controller.dataBaseUrl + "music/" + 'ogg/' + sprintf("%s.ogg", this.currentQuestionId);
	this.songPlayer.setMedia({
		m4a: m4aUrl,
		oga: oggUrl
	});
	//	this.songPlayer.play();
	
	
}
Controller.prototype.initSongPlayer = function() {
	
	var url = "http://" + window.location.host + window.location.pathname;
	url = url.substring(0, url.lastIndexOf('/') + 1);
	var m4aUrl = url + controller.dataBaseUrl + "music/" + 'm4a/__00000.m4a';
	var oggUrl = url + controller.dataBaseUrl + "music/" + 'ogg/__00000.ogg';
	
	
	this.songPlayer = new CirclePlayer("#jquery_jplayer_1",
	{m4a:m4aUrl, oga:oggUrl }, {
		cssSelectorAncestor: "#question-audio"
	});
	
	
	this.songPlayer.player.bind($.jPlayer.event.ready, function(event) {
			
			controller.beginLoadQuestions();
		
			controller.isPreloadFinished = true;
			controller.isSongPlayerReady = true;
			$(this).bind($.jPlayer.event.play, function(event) {
					$('#question-audio-record').addClass('span');
			});
			$(this).bind($.jPlayer.event.pause, function(event) {
					$('#question-audio-record').removeClass('span');
			});
			$(this).bind($.jPlayer.event.stop, function(event) {
					$('#question-audio-record').removeClass('span');
			});
			
			$(this).bind($.jPlayer.event.error), function(event) {
				alert('很抱歉，音频加载出错了！请尝试刷新本页面。');
			}
			
			$('audio').bind('error', function(e) {
				alert('很抱歉，音频加载出错了！错误代码' + e.currentTarget.error.code);
			});
			
			
			controller.songPlayer.player.unbind($.jPlayer.event.ready);
			
			
		
			
	});

	
	
	
}
Controller.prototype.handleAnswerCorrect = function() {
	SM.SetStateByName('finish');
}
Controller.prototype.isAnswerCorrect = function () {
    var answerText = '';
    $(sprintf("#question-%s .answer-key", this.currentQuestionId)).filter(function () {
        return $(this).attr("data-key") != "";
    }).each(function (index, elem) {
        answerText += elem.getAttribute("data-key");
    });
    return this.isAnswerCorrectByText(answerText);
}

Controller.prototype.isAnswerCorrectByText = function (answerText) {
    var encodedAnswerText = $.md5(answerText, answerText);
    if (this.questionRepo[this.currentQuestionIndex]["answer"] == encodedAnswerText) {
        return true;
    }
    return false;
}
Controller.prototype.processToNextQuestion = function () {
	this.songPlayer.player.jPlayer('stop');
    if (this.questionRepo.length > this.currentQuestionIndex + 1) {
        this.currentQuestionIndex++;
        this.currentQuestionLevel++;
        this.nextQuestionLevel++;
        this.currentQuestionId = this.questionRepo[this.currentQuestionIndex]["ID"];
        this.saveInCookie();
        controller.needPreload = false;
    }
    else {
        this.forceFromCurrent = true;
        this.currentQuestionBatch++;
        this.currentQuestionLevel++;
        this.nextQuestionLevel++;
        this.currentQuestionIndex = 0;
        controller.needPreload = true;
    }

}

Controller.prototype.removeLetters = function () {
}

Controller.prototype.update = function () {
    
}
Controller.prototype.preloadInGameUIImages = function() {
	if (document.images) {
		var img1 = new Image();
		img1.src = "img/record.png";

	}
}