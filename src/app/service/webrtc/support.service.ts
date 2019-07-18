import { Injectable } from '@angular/core';

@Injectable()
/**
 * ユーザーメディアが利用可能状況の判定
 */
export class SupportService {


    private mode = { video: false, audio: false, screen: false };
    private mediAPI = null;
    // private mediAPI: any = null;

    constructor() { }

    /**
     * 
     */
    public getMode(): object {
        return this.mode;
    }

    /**
     * 取得中のメディアデバイス情報を返す
     */
    public getMediAPI(): any {
        return this.mediAPI;
    }

    /**
     * 映像、音声、スクリーンのオンオフ切り替え
     * @param video boolean
     * @param audio boolean
     * @param screen boolean
     * videoのみ、スクリーンサイズ等オプションを指定した
     * オブジェクトの設定が可能
     * 例：
     *  { width: 1280, height: 720 } 
     */
    public setDeviceSuppot(video, audio, screen): void {
        this.mode = { video : video, audio: audio, screen: screen };
    }

    /**
     * ビデオ有効化
     * @return SupportService
     */
    public onVideo(): SupportService {
        this.mode.video = true;
        return this;
    }
    /**
     * オーディオ有効化
     * @return SupportService
     */
    public onAudio(): SupportService {
        this.mode.audio = true;
        return this;
    }
    /**
     * ビデオ無効化
     * @return SupportService
     */
    public offVideo(): SupportService {
        this.mode.video = false;
        return this;
    }
    /**
     * オーディオ無効化
     * @return SupportService
     */
    public offAudio(): SupportService {
        this.mode.audio = false;
        return this;
    }

    /**
     * GetUserMediaに対応しているか
     */
    public checkScreenShare(): this {
        if (this.mediAPI !== null) {
            return this;
        }
        if (typeof (navigator.mediaDevices['getDisplayMedia']) === 'function') {
            console.log('Support Media API : getDisplayMedia');
            this.mediAPI = 'getDisplayMedia';

        } else if (typeof (navigator.mediaDevices['getUserMedia']) === 'function') {
            console.log('Support Media API : getUserMedia');
            this.mediAPI = 'getUserMedia';

        } else if (typeof (navigator['webkitGetUserMedia']) === 'function') {
            console.log('Support Media API : webkitGetUserMedia');
            this.mediAPI = 'webkitGetUserMedia';

        } else if (typeof (navigator['mozGetUserMedia']) === 'function') {
            console.log('Support Media API : mozGetUserMedia');
            this.mediAPI = 'mozGetUserMedia';

        } else {
            this.mediAPI = null;
        }
        return this;
    }

    /**
     * MediaDeviceが利用可能な場合
     * 利用可能なデバイス一覧を返す
     */
    public async checkMediaDevice(): Promise<object> {
        return new Promise((resolve, reject) => {
            if (this.mediAPI !== null) {
                navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                        this.checkDevice(devices);
                        console.log(devices);
                        resolve(this.mode);
                    }).catch((error) => {
                        console.error('Not Devices');
                        reject(this.mode);
                    });
            } else {
                console.error('Not UserMedia API');
                alert('Do Not use UserMedia API');
                reject(this.mode);
            }
        });
    }

    /**
     * 利用可能なデバイス一覧を確認し
     * オーディオ、ビデオそれぞれのデバイスが
     * @param devices ローカルデバイス情報
     */
    private checkDevice(devices): void {
        if (devices.length === 0) {
            this.mode.video = false;
            this.mode.audio = false;
        } else {
            for (const key in devices) {
                if (devices.hasOwnProperty(key)) {
                    if (devices[key]['kind'] === 'audioinput') {
                        this.mode.audio = true;
                    } else if (devices[key]['kind'] === 'videoinput') {
                        this.mode.video = true;
                    }
                }
            }
        }
    }

    /**
     * 部屋名作成用のランダム文字列の生成
     * @param len 
     * @param charSet 
     */
    public getRandomString(len, charSet: string = null): string {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < len; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }

    public getRandomNumber(len, charSet: string = null): number {
        charSet = charSet || '0123456789';
        let randomString = '';
        for (let i = 0; i < len; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return Number(randomString);
    }

    /**
     * ビデオ、オーディオデバイスの有無で
     * 配信するコンテンツの有無を設定
     * @param vmode 
     * @param amode 
     */
    public checkStreamMode(vmode, amode): any {
        let v = null;
        const a = amode;
        if (typeof (vmode) === 'boolean' || vmode === null) {
            if (vmode === null) {
                v = true;
            } else {
                v = vmode;
            }
        } else {
            v = {
                mediaSource: vmode,
                displaySurface: 'browser',
            };
        }
        return { video: v, audio: a };
    }


}
