import { Component, OnInit, Renderer2 } from '@angular/core';
import {
    SubjectsService, ImageService,
    WebRTCService
} from '../service';
import {
    ContentService
} from '../service';
import { ImageSaveService } from '../_lib_service';

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: [
      './screen.component.scss'
    ]
})

export class ScreenComponent implements OnInit {

    private server = null;
    private videoElement = null;

    public capture = '';

    public session = '';
    public source = null;

    public myvideoState = {
        'width': 1980,
        'height': 1024,
        'muted': 'muted',
    };

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
        private imageService: ImageService,
        private webrtcService: WebRTCService,
        private contentService: ContentService,
        private imageSaveService: ImageSaveService
    ) {
    }

    ngOnInit(): void {
        // this.initial();
        this.webrtcService.checkMediaDevice();
    }


    /**
     *
     * 画面切り替え
     *
     */
    public showContent(target): boolean {
        return this.contentService.checkShow(target);
    }


    /**
     * スクリーンショットの保存
     */
    public exportScreenShot(index: number): void {
        this.imageService.exportImage(index).then(
            (result) => {
                this.imageSaveService.saveImage(result);
                this.close();
            }
        );
    }

    /**
     * スクリーンショット撮影
     */
    public captureScreen(): void {
        this.imageService.setTarget('screenvideo', '');
        this.capture = this.imageService.addCapture();
    }

    /**
     * スタート処理
     */
    public start(): void {
        // ブラウザがMediaAPIに対応しているか
        if (this.webrtcService.checkScreenShare()) {
            this.setup();
            this.videoElement.addEventListener('playing', () => {
                this.contentService.changeState('CaptureSelect', true);
                this.captureScreen();
                this.stop();
            });
        } else {
            alert('Not Support');
        }
    }

    /**
     * 終了
     */
    public stop(): void {
        this.webrtcService.closeLocalStream();
    }

    public close(): void {
        this.contentService.changeState('CaptureSelect', false);
    }

    /**
     * ストリーム開始
     */
    public async setup(): Promise<any> {
        this.videoSetup().then((result) => {
            if (result) {
                this.webrtcService.playVideo('local');
                return true;
            }
        });
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

    private setVideoElement(): void {
        this.videoElement = document.getElementById('screenvideo');
        this.webrtcService.setVideoTarget(
            this.videoElement
        );
    }


}


