import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
    SubjectsService, ImageService,
    WebSocketService, WebRTCService
} from '../service';
import {
    UserService, ContentService, TextService,
    FileService
} from '../service';
import { ImageSaveService } from '../_lib_service';

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: [
      '../app.component.css',
      './screen.component.scss'
    ]
})

export class ScreenComponent implements OnInit {

    private URL = 'http://happypazdra.dip.jp:8088/janus';
    private URLS = 'https://happypazdra.dip.jp:8089/janus';

    private screen = null;
    private server = null;
    private videoElement = null;
    private remoteElement = [];

    private audioBox = document.getElementById('audioBox');

    public onStart = false;
    public onwebrtcUp = false;

    public capture = '';
    public desc = '';
    public myusername = '';
    public feeds = [];
    public roomid: Number = 0;
    public room: Number = 0;
    public role = '';

    public name = 'Guest';
    public userColor = '';


    // ドラッグ、ドロップ
    public onDrag = false;
    public Reader: FileReader = null;



    public session = '';
    public title = '';

    public source = null;

    public editCaptureTarget = 0;

    public myvideoState = {
        'width': 1024,
        'height': 600,
        'muted': 'muted',
    };
    public peervideoState = {
        'width': 320,
        'height': 240,
    };

    public roomname = '';
    /**
     * contributor  : 映像・音声の配信
     * video        : 映像のみ
     * audio        : 音声の配信
     * listener     : 視聴のみ
     *
     */
    public mode = 'contributor';

    public showBitrate = 0;
    constructor(
        // private janusService: Janus,
        private renderer2: Renderer2,
        private router: ActivatedRoute,
        private subjectService: SubjectsService,
        private imageService: ImageService,
        private websocketService: WebSocketService,
        private webrtcService: WebRTCService,
        private userService: UserService,
        private contentService: ContentService,
        private textService: TextService,
        private fileService: FileService,
        private imageSaveService: ImageSaveService
    ) {
    }

    ngOnInit(): void {
        this.initial();
        // this.setup();
        this.setRoomName();
    }

    private hub(): void {
        this.subjectService.on('on_leave')
        .subscribe((msg: any) => {
          console.log(msg);
          this.userService.delUserByUserId(msg['data']['id']);
        });
        this.subjectService.on('on_allusers')
        .subscribe((msg: any) => {
            console.log(msg);
            this.userService.addMultiUser(msg);
        });
        this.subjectService.on('pub_file_send')
        .subscribe((msg: any) => {
            const data = {
                msg: 'file_send',
                data: msg
            };
            this.webrtcService.sendData(JSON.stringify(data));
        });
        this.subjectService.on('on_webrtc')
        .subscribe((msg: any) => {
            this.webrtcManager(msg);
        });
        this.subjectService.on('on_dchannel')
        .subscribe((msg: any) => {
            this.socketHub(msg);
        });
        this.subjectService.on('on_' + this.roomname)
            .subscribe((msg: any) => {
                if (this.mode === 'contributor' && msg['msg'] === 'new_client') {
                    this.websocketService.send(
                        this.roomname,
                        {
                            msg: 'connectionid',
                            data: this.roomname
                        }
                    );
                } else {
                    this.socketHub(msg);
                }
            });
    }

    private socketHub(msg: any): void {
        if (msg['msg'] === 'connectionid') {
            if (this.roomid === 0) {
                this.roomid = msg['data'];
            }
        } else if (msg['msg'] === 'text') {
            console.log(msg);
            this.textService.addChat(msg['data']);
        } else if (msg['msg'] === 'file_send') {
            this.fileService.addRemoteFile(msg['data']);
            const data = {
                msg: 'sys',
                state: 'file_get'
            };
            this.webrtcService.sendData(JSON.stringify(data));
        } else if (msg['msg'] === 'webrtc') {
            this.webrtcManager(msg);
        } else if (msg['msg'] === 'sys') {
            if (msg['state'] === 'file_get') {
                this.fileService.checkSend();
            }
        }
    }

    /**
     * 部屋名が設定されている場合クライアント処理開始
     */
    private setRoomName(): void {
        this.webrtcService.checkMediaDevice();
        const room = this.router.snapshot.queryParams;
        if (room.hasOwnProperty('room')) {
            console.log(room);
            this.roomname = room['room'];
            // ゲストの接続モード判定
            this.setVideoMode();
        }
    }

    private setVideoMode(): void {
        if (this.webrtcService.checkMediaDevice()) {
            this.webrtcService.checkMediaDevice().then(
                (result) => {
                    if (result['audio']) {
                        this.mode = 'audio';
                    } else {
                        this.mode = 'listener';
                    }
                }
            );
        } else {
            this.mode = 'listener';
        }
    }

    private setupSocket(): void {
        this.websocketService.setColor(this.userColor);
        this.websocketService.setRoomName(this.roomname);
        this.websocketService.setNameSpace('test1');
        this.websocketService.setName(this.name);
        this.websocketService.connection(
            [
                this.roomname, 'allusers'
            ]
        );
    }

    private getConnectionCode(): void {
        console.log('send mes ' + this.roomname);
        this.websocketService.send(
            this.roomname,
            {
                msg: 'new_client'
            }
        );
    }


    /**
     *
     * 画面切り替え
     *
     */

    public showContent(target): boolean {
        return this.contentService.checkShow(target);
    }

    public changeContent(target: string, bool: boolean = null): void {
        this.contentService.changeState(target, bool);
    }

    public changeDashbordeContent(target: string): void {
        this.contentService.showDashbordeContent(target);
    }

    public closeDashborde(): void {
        this.contentService.closeDashborde();
    }

    /**
     *
     * 接続中ユーザー
     *
     */
    public getUsers(): object {
        return this.userService.getAllUser();
    }

    /**
     * タグ移動On/OFF
     */
    public moveEditerTag(index, on, e: any = null): void {
        if (on) {
            this.imageService.setMoveTag(index, e);
        } else {
            this.imageService.closeMoveTag(e);
        }
    }
    /**
     * タグ移動処理
     * @param e マウスイベント
     */
    public moveEditerTagPosition(e): void {
        this.imageService.moveTag(e);
    }
    public deleteTag(index): void {
        this.imageService.deleteTag(index);
    }

    public addEditerTag(e): void {
        this.imageService.setupTag();
    }
    public closeCaputureEdit(): void {
        this.imageService.closeEditer(this.editCaptureTarget);
        this.contentService.changeState('CaptureEditer', false);
        this.editCaptureTarget = null;
    }

    /**
     * スクリーンショットの保存
     */
    public exportScreenShot(index: number): void {
        this.imageService.exportImage(index).then(
            (result) => {
                this.imageSaveService.saveImage(result);
            }
        );
    }
    /**
     *
     * Janus
     *
     */


    /**
     * 画面共有モードの設定
     * @param mode 画面共有モード
     */
    public setShareMode(mode: string): void {
        if (mode === 'screen') {
            this.capture = mode;
        } else if (mode === 'window') {
            this.capture = mode;
        } else if (mode === 'application') {
            this.capture = mode;
        }
        this.setup();
    }

    public checkEnterShare(event): boolean {
        const theCode = event.charCode;
        if (theCode === 13) {
            this.preShareScreen();
            return false;
        } else {
            return true;
        }
    }

    /**
     * 部屋名入力後の共有画面取得開始
     */
    public preShareScreen(): void {
        // Create a new room
        this.contentService.changeState('ScreenMenu', false);
        if (this.desc === '') {
            // before bootbox alert
            console.log('Please insert a description for the room');
            this.contentService.screenReset();
            return;
        }
        this.title = this.desc;

        // ブラウザがMediaAPIに対応しているか
        if (this.webrtcService.checkScreenShare()) {
            this.contentService.changeState('ScreenSelect', true);
        } else {
            alert('Not Support');
        }
    }

    /**
     * クライアントを配信に参加させる
     */
    public joinScreen(): Promise<boolean> {
        // Join an existing screen sharing session
        this.contentService.changeState('ScreenMenu', false);
        if (isNaN(Number(this.roomid))) {
            // before bootbox alert
            console.log('Session identifiers are numeric only');
            this.contentService.changeState('ScreenStart', false);
            this.contentService.changeState('ScreenMenu', true);
            return;
        }
        this.room = this.roomid;
        this.myusername = this.name;

        if (this.mode === 'audio') {
            return new Promise((resolve) => {
                if (this.webrtcService.checkScreenShare()) {
                    this.webrtcService.getLocalStream(false, true)
                    .then((result) => {
                        resolve(result);
                    });
                } else {
                    resolve(false);
                }
            });
        } else {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(false);
                }, 10);
            });
        }
    }

    public videoPlaying(): void {
        this.contentService.showVideoPlay();
    }


    /**
     * httpとhttpsに応じてサーバー接続先切り替え
     */
    private initial(): void {
        console.log(window.location.protocol);
        if (window.location.protocol === 'http:') {
            this.server = this.URL;
        } else if (window.location.protocol === 'https:') {
            this.server = this.URLS;
        }
        this.audioBox = document.getElementById('audioBox');
    }

    /**
     * スタート処理
     */
    public start(): void {
        this.onStart = true;
        this.userColor = this.userService.getColor();
        this.contentService.showStartSequence();

        if (this.mode === 'listener' || this.mode === 'audio') {
            // ローカルストリーム表示
            this.contentService.showListenerSequence();
            console.log('Setup Websocket Client Mode');
            this.webrtcService.setVideoMode(this.mode);

            // ローカルストリームが取得可能な場合
            // ストリームを取得し配信に参加する
            this.joinScreen()
                .then((result) => {
                    // websocket受信待受
                    this.hub();
                    // websocket 接続開始
                    this.roomid = Number(this.roomname);
                    this.room = this.roomid;
                    this.setupSocket();

                    // スクリーン表示準備
                    this.setScreeElement();
                    this.getConnectionCode();
                    this.startStream();
                });

        } else if (this.mode === 'contributor') {
            if (!this.webrtcService.checkScreenShare) {
                this.AllReset();
                alert('サポート対象外のブラウザです');
            }
            this.webrtcService.setVideoMode('contributor');
            this.room = this.webrtcService.getRandomNumber(8);
            this.roomid = this.room;
            this.roomname = String(this.roomid);
        }
    }

    public stop(): void {
        this.onStart = false;
    }


    /**
     *
     * WebRTCヒデオ送信
     *
     */
    private setScreeElement(): void {
        this.videoElement = document.getElementById('screenvideo');
        this.webrtcService.setContributorTarget(
            this.videoElement
        );
    }
    private setVideoElement(): void {
        this.videoElement = document.getElementById('screenvideo');
        this.webrtcService.setVideoTarget(
            this.videoElement
        );
    }

    /**
     * ローカルストリームを取得する
     */
    public videoSetup(): Promise<boolean> {
        this.setVideoElement();
        return new Promise((resolve, reject) => {
            this.webrtcService.getLocalStream(this.capture, true)
                .then((result) => {
                    resolve(result);
                });
        });
    }
    /**
     * ストリーム開始
     */
    public setup(): void {
        this.videoSetup().then((result) => {
            if (result) {
                // ローカルストリーム表示
                this.contentService.showLocalStream();

                // webソケットイベント受信設定開始
                this.hub();
                // websocket接続開始
                this.setupSocket();


                if (this.contentService.checkShow('ScreenVideo') === false) {
                    this.myvideoState.muted = 'muted';
                    this.contentService.changeState('ScreenVideo', true);
                }
                const video: any = document.getElementById('screenvideo');
                video.muted = true;
                this.webrtcService.playVideo('local');
            }
        });
    }

    /**
     * ストリームを止める
     */
    public shutdown(): void {
        this.videoElement.pause();
        if (this.videoElement.src && (this.videoElement.src !== '') ) {
            window.URL.revokeObjectURL(this.videoElement.src);
        }
        this.videoElement.src = '';
    }

    /**
     * WebRTC通信開始
     */
    public startStream(): void {
        console.log('Start Stream for ' + this.mode);
        this.websocketService.send(
            this.roomname,
            {
                'msg': 'webrtc',
                'job': 'request_offer',
                'mode': this.mode
            }
        );
    }

    /**
     * WebRTC通信止める
     */
    public stopStream(): void {
        this.webrtcService.hungUp();
    }

    private webrtcManager(result): void {
        const mode = this.webrtcService.getVideoMode();
        if (result['job'] === 'send_sdp') {
            this.websocketService.send(
            this.roomname,
            {
                'msg': 'webrtc',
                'job': 'remote_sdp',
                'data': result['data'],
                'to': result['id'],
                'mode': this.mode
            });
        } else if (result['job'] === 'remote_sdp') {
            const data = JSON.parse(result['data']);
            if ('id' in result) {
                if (this.webrtcService.checkAuthConnection(result['id']) === true
                    && this.webrtcService.checkMode(['audio', 'listener'])
                ) {
                    if (result['mode'] === 'contributor') {
                        console.log('Screen On');
                        this.addScreenElement(result['id']);
                    } else if (result['mode'] === 'audio') {
                        this.addAudioElement(result['id']);
                    }
                }
            }
            this.webrtcService.onSdpText(data, result['id']);
        } else if (
            result['job'] === 'request_offer'
            && this.webrtcService.checkMode(['contributor'])) {

            console.log('get offer request');
            console.log(result);
            if (this.webrtcService.checkAuthConnection(result['id'])) {
                this.webrtcService.makeOffer(result['id']);
                if (mode === 'contributor') {
                    console.log('Add Audio Element');
                    this.addAudioElement(result['id']);
                }
            }
        }
    }

    private addScreenElement(id): void {
        this.webrtcService.setContributorTarget(this.videoElement);
    }
    private addAudioElement(id): void {
        if (!this.remoteElement[id]) {
            const video = this.addRemoteVideoElement(id);
            this.webrtcService.setRemoteVideoTarget(video, id);
        }
    }
    private addRemoteVideoElement(id): void {
        const video = this.createVideoElement('remote_video_' + id);
        this.remoteElement[id] = video;
        return this.remoteElement[id];
    }

    private deleteRemoteVideoElement(id, type = 'id'): void {
        if (type === 'id') {
            this.removeVideoElement('remote_video_' + id);
            delete this.remoteElement[id];
        } else if (type === 'all') {
            for (const key in this.remoteElement) {
                if (this.remoteElement.hasOwnProperty(key)) {
                    this.removeVideoElement('remote_video_' + key);
                    delete this.remoteElement[key];
                }
            }
        }
    }

    private createVideoElement(id): any {
        const audio = this.renderer2.createElement('audio');
        audio.id = id;
        audio.setAttribute('class', 'hideon');

        this.audioBox.appendChild(audio);
        return audio;
    }

    private removeVideoElement(id): any {
        const audio = document.getElementById(id);
        this.audioBox.removeChild(audio);
        return audio;
    }

    private AllReset(): void {
        this.contentService.screenReset();

        this.onStart = false;

        this.capture = '';
        this.desc = '';
        this.myusername = '';
        this.roomid = 0;
        this.room = 0;
        this.role = '';

        this.session = '';
        this.title = '';

        this.source = null;
    }
}


