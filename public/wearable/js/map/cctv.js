var VIDEO_PLAYER = null;

$(function() {
	var cctvDrag;
	
	//CCTV 창을 마우스로 움직일 수 있도록 한다.
	$("#cctv_popup_title").mousedown(function(e) {
		cctvDrag = $(".cctv_popup").draggable({ containment: "window" });
		if (e.preventDefault) {
			e.preventDefault(); //FF
		} else {
			e.returnValue = false; //IE
		}
	});

	$("#cctv_popup_title").mouseup(function(e) {
		cctvDrag.draggable("destroy");
		if (e.preventDefault) {
			e.preventDefault(); //FF
		} else {
			e.returnValue = false; //IE
		}
	});


	//cctv popup 리스트 클릭시 활성화 스타일 적용하고 재생한다.
	$(document).on('click', '.cctv_list .cctv_name', function() {
		//cctv_popup cctv_name active
		$(this).removeClass("active");
		$(this).siblings().each(function() {
			$(this).removeClass("active");
		});
		$(this).addClass("active");

		if (VIDEO_PLAYER != null) {
			cctvController.stop();
			VIDEO_PLAYER = null;
		}

		
		//cctv info text
		var name = $(this).data('name');
		var installLocation = $(this).data('install-location');
		var mgrs = $(this).data('mgrs');
		var coord = $(this).data('coord');
				
		$(".cctv_popup .popup_header .popup_title").text(name);
		$("#cctv_device_name").text(name);
		$("#cctv_install_location").text(installLocation);
		$("#cctv_mgrs").text(mgrs);
		$("#cctv_latitude").text(coord.split(",")[1]);
		$("#cctv_longitude").text(coord.split(",")[0]);
		
		//cctv video play
		var serverIp = $(this).data('server-name');
		var serverSession = $(this).data('server-session');
		
		cctvController.playCctvSingle(serverIp, serverSession);
	});

	$(".cctv_popup .btn_close").click(function() {
		if (VIDEO_PLAYER != null) {
			stop();
			VIDEO_PLAYER = null;
		}

		$("#cctv_name").html('');
		$(".cctv_popup").hide();
		$(".cctv_popup").css('top', 'calc(270px - 56px)');
		$(".cctv_popup").css('left', 'calc(50% - (1136px / 2)');
	});
});
/**
 * cctv 레이어 스타일 및 cctv 팝업을 제어한다.
 */
var cctvController = (function() {
	var showLog = true;
	
	var callOpen = function(to, targetId, serverIp, serverSession) {
		to.setDefaultWaitTime(5);
			
		to.open(targetId, serverIp, '8880', serverSession, serverIp + ':3478');
		to.onopen = (evt) => console.log(to.name() + ': Signaling channel opened');
		to.onclose = (evt) => console.log(to.name() + ': Closed');
	};

	var playCctvSingle = function(serverIp, serverSession) {
		if (VIDEO_PLAYER == null) {
			VIDEO_PLAYER = new AcesServer(showLog);
		}
		
		callOpen(VIDEO_PLAYER, "cctv_video", serverIp, serverSession);
	};


	var stop = async function() {
		VIDEO_PLAYER.shutdown();
		await sleep(50);
	};


	var that = {
		playCctvSingle: function(serverIp, serverSession) {
			playCctvSingle(serverIp, serverSession);
		},
		stop: async function() {
			await stop();
		}
	};

	return that;
})();
