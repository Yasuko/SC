import { Injectable } from '@angular/core';

@Injectable()
export class ContentService {

    private show = {
        CaptureSelect: false,
    };


    public checkShow(target: string): boolean {
        if (this.show.hasOwnProperty(target)) {
            return this.show[target];
        }
        return false;
    }

    /**
     * コンテンツフラグの変更
     * @param target ターゲットコンテンツ
     * @param bool フラグ、無しの場合フラグ反転
     * @return boolean
     */
    public changeState(target, bool: boolean | null = null): boolean {
        if (this.show.hasOwnProperty(target)) {
            if (bool !== null) {
                this.show[target] = bool;
                return this.show[target];
            }
            if (this.show[target]) {
                this.show[target] = false;
            } else {
                this.show[target] = true;
            }
            return this.show[target];
        }
        return false;
    }


    public screenReset(): void {
        this.show = {
            CaptureSelect: false,
        };
    }

}

