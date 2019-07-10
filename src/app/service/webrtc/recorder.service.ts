import { Injectable } from '@angular/core';
declare var MediaRecorder: any;

@Injectable()
export class RecorderService {
    private Stream: any = null;
    private recorder: any;
    private recordData = [];
    private recordeTarget: any;
    private recordeURL: any;

    private Options = {
        videoBitsPerSecond  : 512000,
        mimeType            : 'video/webm; codecs=vp9'
    };

    constructor() {}

    /**
     * 録画するデータストリームを取得
     * @param stream 
     */
    public setStream(stream): this {
        this.Stream = stream;
        return this;
    }

    /**
     * 録画映像の再生先登録
     * @param target 録画再生ターゲットDOM
     */
    public setRecordePlayer(target): this {
        this.recordeTarget = target;
        return this;
    }

    /**
     * 
     * @param time 
     */
    public setRecordOptions(option: object): this {
        this.Options.videoBitsPerSecond = 
                ('videoBitsPerSecond' in option)
                    ? option['videoBitsPerSecond']
                    : this.Options.videoBitsPerSecond;
        return this;
    }

    /**
     * 録画開始
     * @param time 録画時間
     * デフォルトで録画時間は10秒
     * コーデックはvp9
     * ビットレート　512kにて録画される
     */
    public startRecord(time: number = 1000): this {
        if (this.recorder === null) {
            this.recorder = new MediaRecorder(this.Stream, this.Options);
            this.recorder.ondataavailable = (result) => {
                this.recordData.push(result.data);
            };
            this.recorder.start(time);
        }
        return this;
    }
    /**
     * 録画停止
     */
    public stopRecord(): void {
        this.recorder.onstop =  (result) => {
            this.recorder = null;
        };
        this.recorder.stop();
    }

    /**
     * 録画の再生
     */
    public plyaRecord(): void {
        if (this.recordeTarget === null) {
            console.error('Recorde Player Not Set');
            return;
        }
        const videoBlob = new Blob(
                this.recordData,
                { type: 'video/webm'}
            );
        this.recordeURL = window.URL.createObjectURL(videoBlob);

        if (this.recordeTarget.src) {
            window.URL.revokeObjectURL(this.recordeTarget.src);
            this.recordeTarget.src = null;
        }
        this.recordeTarget.src = this.recordeURL;
        this.recordeTarget.play();
    }

    /**
     * 録画データのDL用URL取得
     */
    public getRecordeURL(): string {
        return this.recordeURL;
    }

}
