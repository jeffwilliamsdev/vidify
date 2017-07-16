// Vidify.js
// Custom Video controls
// Written by Jeff Williams

var device = navigator.userAgent.toLowerCase()
var mobileos = device.match(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i)

var loadedmeta = false;

window.addEventListener('loadedmetadata', function(e) { loadedmeta = true;  }, true);

$.fn.vidify = function( config ) {
	var video = this;

	video.totalTime = 0;

	var defaults = {
		fullscreen : true,
		showTime : true,
		vidContainer : $(' <div class="vid-container" />' ),
		controls : $(' <div class="controls" />' ),
		playPauseBtn : $( '<div class="playpause" />' ),
		fullscreenBtn : $( '<div class="fullscreen" />' ),
		progress : $( '<div class="progress" />' ),
		updateProgress : $( '<div class="updateprogress" />' ),
		timeContainer : $( '<div class="time" />' )
	}

	var config = $.extend( {}, defaults, config );

	return this.each(function() {
		setupWrapper();
		setupControls();
		eventListeners();
		( config.showTime && loadedmeta ) ? setupTimeContainer() : video.on('loadedmetadata', setupTimeContainer);
	});

	function setupWrapper() {
		video.wrap( config.vidContainer );
		video.after( config.controls );
		video.addClass(' vidify ');
		config.controls.append( config.playPauseBtn );
		config.controls.append( config.progress );
		config.progress.append( config.updateProgress );
		config.fullscreen ? config.controls.append( config.fullscreenBtn ) : 0;
	}

	function setupControls() {
		if (mobileos) {
			$('.controls').hide();
			video.attr('controls', true)
		}
		else {
			video.removeAttr( 'controls' );
			config.fullscreenBtn.html( '<i class="fa fa-arrows-alt"></i>' );
			config.playPauseBtn.html( '<i class="fa fa-play"></i>' );
			( config.showTime ) ? config.controls.addClass( 'timer') : 0;
		}

	}

	function fullscreenClick() {
		 var elem = video[0];
            if (!document.fullscreenElement && !document.mozFullScreenElement &&
              !document.webkitFullscreenElement && !document.msFullscreenElement) {
                  if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                  }
                  else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                  }
                  else if (elem.mozRequestFullScreen) {
                    video.parent()[0].mozRequestFullScreen();
                  }
                  else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                  }
            }
            else {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                  }
                  else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                  }
                  else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                  }
                  else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                  }
            }
    }

 	function setupTimeContainer() {
		if (config.showTime) {
			config.fullscreenBtn.before( config.timeContainer );
			video.totalTime = convertSeconds( video[0].duration );
			config.timeContainer.text( '-- / ' + video.totalTime );
		}
    }

	function playClick(e) {
		e.stopPropagation();
		video.parent().siblings('.play-btn').toggleClass('hide');
		video.parent().toggleClass('playing');
		video[0].paused ? video[0].play() : video[0].pause();
	}

	function eventListeners() {
		var lastTimeMouseMoved = 0;
		video.on('mousemove', function() {
			if (video.parent().hasClass('hasPlayed')) {
				config.controls.addClass('show');
			}
			lastTimeMouseMoved = new Date().getTime();
			setTimeout(function() {
		  		var currentTime = new Date().getTime();
			    if (currentTime - lastTimeMouseMoved >= 2000) {
			    	config.controls.removeClass('show');
			 	 }
		 	 }, 2000)
		})

		config.fullscreenBtn.on('click', fullscreenClick);
		config.controls.on('click', function(e) {
			e.stopPropagation();
		})
		video.parent().on('click', playClick);
		config.playPauseBtn.on('click', playClick);

		video.on( 'play', function(e) {
			video.parent().addClass('hasPlayed');
			config.playPauseBtn.html( '<i class="fa fa-pause"></i>' );
			config.controls.toggleClass( 'playing ');
		})

		video.on( 'pause', function(e) {
            config.playPauseBtn.html( '<i class="fa fa-play"></i>' );
            config.controls.toggleClass( 'playing' );
		})

		video.on( 'ended', function(e) {
         	config.playPauseBtn.html( '<i class="fa fa-play"></i>' );
         	video[0].currentTime = 0;
         	video.parent().removeClass( 'hasPlayed playing' );
        })

        video.on( 'timeupdate', function() {
            var currentPos = video[0].currentTime;
            if ( config.showTime )  {
            	var time = convertSeconds( video[0].currentTime );
            	config.timeContainer.text( time + ' / ' + video.totalTime );
            }
            var maxduration = video[0].duration;
            var percentage = 100 * ( currentPos / maxduration );
            config.updateProgress.css({ 'width' : percentage + '%'});
        })

        config.progress.on('click', function(e) {
            var x = e.clientX;
            var $this = $(this);
            var pos = x - config.progress.offset().left ;
            var posPercentage = 100 * ( pos / $this.width() ) ;
            config.updateProgress.css({ 'width' : posPercentage + '%' });
            video[0].currentTime = video[0].duration * posPercentage / 100;
        })
	}

	function convertSeconds( seconds ) {
		var time = [ Math.floor(seconds/60/60) % 24,
					 Math.floor(seconds/60) % 60,
					 Math.floor(seconds%60) ];

		var hours = time[0] ? time[0]+':' : '';
        var minutes = time[1] ? time[1] + ':' : '0:';
        var seconds = time[2] ? time[2] : '0';
        (minutes < 10) ? minutes = ('0' + minutes ) : minutes;
        (seconds < 10 ) ? seconds = ('0' + seconds ) : seconds;
		return ( hours + minutes + seconds );
	}
}
