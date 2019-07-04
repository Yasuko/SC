import { Injectable } from '@angular/core';

@Injectable()
export class SupportService {


    private mode = { video: false, audio: false, screen: false };
    private mediAPI = 'getUserMedia';

    constructor() { }

    public getDeviceSupport(): object {
        return this.mode;
    }

    public getMediAPI(): string {
        return this.mediAPI;
    }

    public setDeviceSuppot(video, audio, screen): void {
        this.mode = { video : video, audio: audio, screen: screen };
    }

    public onVideo(): void {
        this.mode.video = true;
    }

    public onAudio(): void {
        this.mode.audio = true;
    }

    public offVideo(): void {
        this.mode.video = false;
    }

    public offAudio(): void {
        this.mode.audio = false;
    }

    /**
     * GetUserMediaに対応しているか
     */
    public checkScreenShare(): boolean {
        if (typeof (navigator['getDisplayMedia']) === 'function') {
            this.mediAPI = 'getDisplayMedia';
            // console.log('Support Media API : getUserDisplayMedia');
            return true;
        } else if (typeof (navigator['getUserMedia']) === 'function') {
            this.mediAPI = 'getUserMedia';
            // console.log('Support Media API : getUserMedia');
            return true;
        } else {
            // console.log('Support Media API : None');
            return false;
        }
    }

    /**
     * MediaDeviceが利用可能か
     */
    public checkMediaDevice(): Promise<object> {
        return new Promise((resolve, reject) => {
            if (this.checkScreenShare()) {
                navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                        this.checkDevice(devices);
                        resolve(this.mode);
                    }).catch((error) => {
                        console.error('Not Devices');
                        reject(this.mode);
                    });
            } else {
                console.error('Not UserMedia API');
                reject(this.mode);
            }
        });
    }

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




}
