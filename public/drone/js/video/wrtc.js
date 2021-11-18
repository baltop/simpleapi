
        /* =============================================================================
         * HDS7000으로부터 영상 정보를 받기 위한 기본 코드임
         *
         *  필요할 경우 ACES Tech에서 수정함.
         * =============================================================================
         */
function AcesServer(showDebugLog) {
    var master = this;
    var sock;
    var pc = null;
    var stunServer = '';
    var targetVideo;
    var receiver;
    var myVideo;
    var sourceIp;
    var sourceBitrate = 0;
    var sourceResolution;
    var timerId;
    var timeoutId = null;
    var dropped = 0;
    var framesDecoded = 0;
    var failCount = 0;
    var failMax = 3;
    var defaultWaitTime = 3;            
    var waitCount = 0;
    var frameCount = 0;
    var stopped = true;

    this.sessionName = '';
    this.targetIP = '';
    this.targetPort = '';
    this.state = 'idle';
    this.openNext = false;
    this.peerConnection = pc;
    this.timerRunCount = 0;

    /*
     * 아래 함수들은 다른 함수로 대체하지 말것!!!!
     */
    /* open(to, ip, port, name, stun)
     *  to:         영상을 출력할 video id
     *  ip:         HDS7000 ip address
     *  port:       HDS7000 WebRTC port (현재는 554로 RTSP와 같음)
     *  name:       보고자 하는 카메라 세션 이름
     *  stun:       STUN 서버
     *              client가 NAT 뒤에 있을 경우 HDS7000 설치 기관에서 운영하는
     *              STUN 서버를 지정함.
     *              HDS7000 서버와 client가 같은 망에 있을 경우 HDS7000 자체에서
     *              STUN 서버를 지원함.
     */
    this.openNow = function() {
        var url = 'ws://' + master.targetIP + ':' + master.targetPort
                  + '/streaming?session=' + master.sessionName;

        /* OnDemand로 처리할 사항인지 확인 */
        if (sourceResolution != undefined && sourceResolution != null && sourceResolution != "")
            url = url + ';resolution=' + sourceResolution;
        if (sourceIp != undefined && sourceIp != null && sourceIp != "")
            url = url + ';source=' + sourceIp;
        if (sourceBitrate != undefined && sourceBitrate != null && sourceBitrate != "")
            url = url + ';bitrate=' + sourceBitrate;

        /* Signalling을 처리할 WebSocket을 열고 명령을 전송함 */
        master.state = 'connecting';
        sock = new WebSocket(url, 'streaming');
        sock.onopen = (evt) => {
            /* Signalling 시작 */
            sock.send(JSON.stringify({ type: 'HELLO' }));
            master.onopen(evt);
        }
        sock.onmessage = (evt) => this.onmessage(JSON.parse(evt.data));
        sock.onerror = (evt) => this.onerror(evt);

        /* 접속이 안된 경우 재접속하도록 함 */
        master.timerRunCount = 0;
        frameCount = 0;
        timerId = setInterval(master.timerHandler, 1000);
    }
    this.open = function(to, ip, port, name, stun, src, resolution, bitrate, waitTime) {
        master.sessionName = name;
        master.targetIP = ip;
        master.targetPort = port;
        if (waitTime != null)
            defaultWaitTime = waitTime;
        stopped = false;
        targetVideo = to;
        stunServer = stun;
        sourceIp = src;
        sourceResolution = resolution;
        sourceBitrate = bitrate;
        failMax = defaultWaitTime;
        waitCount = 0;

        if (sock != null && sock.readyState == 1)
            master.retry('Socket is not opened');
        else
            master.openNow();
    }
    this.close = function(msg, timeValue) {
        /*
         * 종료 처리
         *
         */
        if (msg !== null && msg !== undefined)
            master.logOut(msg);
        if (sock !== null) {
            if (sock.readyState == 1) {
                /* End of connection, let the server know this */
                sock.send(JSON.stringify({ type: 'BYE' }));
                if (myVideo != null) {
                    myVideo.pause();
                    myVideo.currentTime = 0;
                }
            }
            if (sock.readyState < 2) {
                /* Close WebSocket */
                sock.close();
            }
            sock = null;
        }
        if (pc != null) {
            /* Close RTCPeerConnection */
            pc.close();
            pc = null;
            master.peerConnection = pc;
        }
        if (timerId != null) {
            /* Cancel any pending error handling timer */
            clearInterval(timerId);
            timerId = null;
        }
        if (timeoutId != null) {
            /* Cancel any timeout request */
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (master.openNext) {
            /* If the caller wants to restart or reopen the channel */
            master.openNext = false;
            timeoutId = setTimeout(function() {
                master.openNow();
            }, timeValue !== null ? timeValue : 100);
        }
        master.state = 'closed';
        master.onclose(master.state);
    }
    this.shutdown = function() {
        stopped = true;
        master.openNext = false;
        master.close();
    }
    this.onmessage = function(evt) {
        /*
         * Signaling message 처리 - 나머지는 STUN & DTLS로 처리함
         */
        switch (evt.type) {
        case 'offer':
            master.setRemoteDescription(evt);
            break;

        case 'candidate':
            master.addIceCandidate(evt);
            break;
        }
    }
    this.name = () => master.sessionName;
    this.send = (msg) => {
        if (sock.readyState == 1)
            sock.send(msg);
    }
    this.sendJson = (msg) => {
        if (sock.readyState == 1)
            sock.send(JSON.stringify(msg));
    }
    this.onerror = (evt) => {
        this.retry('Connection failed', 1000);
    }
    this.retry = function(msg, timeValue) {
        if (!stopped) {
            master.openNext = true;
            master.close(msg + ', retrying', timeValue);
        }
    }
    this.timerHandler = function() {
        switch (master.state) {
        case 'connecting':
            if (master.timerRunCount > 3)
                 master.retry('Initial connection failed');
            break;

        case 'connected':
            pc.getStats().then(function(evt) {
                evt.forEach(function(report) {
                    if (report.id.indexOf('RTCMediaStreamTrack') != -1) {
                        /*
                         * 영상이 정상적으로 수신 및 디코딩이 되면
                         * framesDecoded가 증가함. 만약 증가하지 않는다면
                         * 영상 표출에 문제가 있는 것이므로 재접속해서
                         * 영상을 다시 받는 것이 나은 선택임.
                         */
                        if (framesDecoded == report.framesDecoded) {
                            if (++failCount >= failMax) {
                                failMax = 3;
                                master.retry('No frame incoming..');
                            }
                        } else {
                            framesDecoded = report.framesDecoded;
                            frameCount = framesDecoded;
                            waitCount = 0;
                            if (failMax < 10)
                                failMax++;
                        }
                        // master.logOut(report.framesDropped + '/' + report.framesDecoded);
                    }
                });
            });
            if (frameCount == 0 && ++waitCount > 5) {
                waitCount = 0;
                master.retry('Connection lost?');
            }
            break;

        default:
            break;
        }
        master.timerRunCount++;
    }
    this.setDefaultWaitTime = function(waitTime) {
        defaultWaitTime = waitTime;
    }
    /*
     * setRemoteDescription
     *      서버로부터 offer를 받았을 때 호출하며 client에서 접속을
     *      하기 위한 처리임.
     */
    this.setRemoteDescription = function(msg) {
        if (pc === null)
            this.prepareConnection();

        /*
         * 서버로부터 받은 OFFER sdp를 기준으로 접속 준비를 함
         */
        if (msg.sdp) {
            this.logOut('OFFER!!!!-------------\n' + msg.sdp);

            dropped = 0;
            failCount = 0;
            framesDecoded = 0;
            pc.setRemoteDescription(new RTCSessionDescription(msg),
                (evt) => this.prepareAnswer(evt),
                (evt) => this.close('setRemoteDescription failed' + evt)
            );
        }
    }
    this.prepareAnswer = function(evt) {
        if (pc.remoteDescription.type == 'offer') {
            pc.createAnswer().then(
                (desc) => {
                    pc.setLocalDescription(desc,
                        () => {
                            master.send(JSON.stringify(pc.localDescription));
                            master.logOut('Local Description ===> '
                                          + JSON.stringify(pc.localDescription, null, 2));
                        },
                        (evt) => master.close('setLocalDescription failed!!!!-----------\n'
                                              + evt));
                },
                (evt) => master.close('createAnswer Failed' + evt)
            );
        } else
            master.close('Unknown message type from the peer: '
                         + pc.remoteDescription.type);
    }
    this.prepareConnection = function() {
        const config = {
            iceServers: [{
                // 사용자가 지정한 STUN server임
                urls: 'stun:' + stunServer

                // 만약 client가 server와 분리된 사설 IP를 사용할 경우 아래 주소를
                // 사용하도록 함. 또는 해당 기관에서 운영하는 STUN 서버를 이용하도록
                // 하여야 함.
                // urls: 'stun:stun.stunprotocol.org:3478'
            }]
        };
        pc = new RTCPeerConnection(config);
        master.peerConnection = pc;

        /*
         * event 처리 함수들을 등록함
         */
        pc.onicecandidate = function(event) {
            /*
             * ICE candidate:
             *  서버와 통신하기 위한 ip:port 조합을 말함.
             *  NAT을 사용하면서 공인망에 붙을 경우 local 주소 및 공인 ip 주소가
             *  ICE candidate가 될 수 있음. (ICE candidate가 2개가 된다는 뜻임)
             *  서버와 같은 망에 있다고 가정하면 local 주소만 받을 수 있음.
             *  candidate가 NULL일 경우 the end of candidate이므로 이것도 반드시
             *  상대편에게 보내야 함.
             */
            var candidate = event.candidate ? event.candidate.candidate : '';
            master.logOut('Local ICE Candidate ===> ' + (candidate == '' ? 'End' : candidate));

            // 서버로 이 정보를 보내서 관련 정보를 설정하도록 함
            master.sendJson({
                type: 'candidate',
                candidate: candidate
            });
        }

        /*
         * ICE state changed
         */
        pc.addEventListener('connectionstatechange', event => {
            master.logOut('ConnectionState=>' + event.currentTarget.connectionState);
            if (event.currentTarget.connectionState == 'connected')
                master.logOut('OK!!!!!!!');
        });

        /*
         * When connected..
         */
        pc.ontrack = function(evt) {
            /*
             * ICE, STUN 및 DTLS 협의까지 마치면 서버에서 영상을
             * 보내기 직전 단계까지 간 것이므로 해당 스트림을
             * video 항목과 연결시켜 보여줄 수 있도록 함.
             */
            myVideo = document.getElementById(targetVideo);
            myVideo.srcObject = evt.streams[0];
            receiver = evt.receiver;
            receiver.onerror = evt => {
                master.logOut('Receiver error' + evt);
            };
            receiver.track.muted = false;
            master.state = 'connected';
        };
    }

    /*
     * addIceCandidate
     */
    this.addIceCandidate = function(msg) {
        master.logOut('Remote ICE Candidate ===> '
                    + (msg.candidate != '' ? msg.candidate : 'End'));

        pc.addIceCandidate(msg).then(
            () => master.logOut("addIceCandidate OK!!!"),
            (evt) => master.logOut("addIceCandidate Failed!!!" + evt));
    }

    /*
     *
     */
    this.logOut = (msg) => {
        if (showDebugLog)
            console.log(master.sessionName + ': ' + msg);
    }

    function logError(error) {
        console.log(error.name + ': ' + error.message);
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
