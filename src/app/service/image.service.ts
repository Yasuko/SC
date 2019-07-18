import { Injectable } from '@angular/core';
// import { COPYFILE_EXCL } from 'constants';
@Injectable()
export class ImageService {
    private targetTag: any = null;
    private resultTag: any = null;
    private editTag: any = null;
    private layerTag: any = null;

    private images = [];

    public setTarget(target, result): void {
        if (typeof target !== 'object') {
            target = document.getElementById(target);
        }
        this.targetTag = target;
        this.resultTag = result;
    }

    public setEditer(editer, layer): void {
        this.editTag = editer;
        this.layerTag = layer;
    }



    public getCapture(): object {
        return this.images;
    }

    public getCaptureToIndex(index): string {
        return this.images[index];
    }

    public getCaptureContent(index): object {
        return this.getCaptureContent[index];
    }


    /**
     * スクリーンショットを撮る
     * @return string 画像データのbase64文字列
     */
    public addCapture(): string {
        const img = this.CaptureVideo();
        this.images.push({
            image: img,
            layer: null,
            memo: []
        });
        return img;
    }

    public async saveImage(index): Promise<boolean> {
        const edit_img = this.CaputureEdit(this.editTag);
        const layer_img = this.CaputureEdit(this.layerTag);
        this.images[index] = {
            image: edit_img,
            layer: layer_img,
            memo: ''
        };
        return false;
    }

    public exportImage(index): Promise<any> {

        const oc = <HTMLCanvasElement> document.createElement('canvas');
        const ctx = oc.getContext('2d');
        const layer = new Image();
        layer.src = this.images[index].layer;

        return new Promise((resolve) => {
            const loadImage = () => {
                const memo = this.images[index].memo;
                const img = new Image();
                    img.onload = (e) => {
                        oc.setAttribute('width', (img.naturalWidth).toString());
                        oc.setAttribute('height', (img.naturalHeight).toString());
                        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
                        ctx.drawImage(layer, 0, 0, img.naturalWidth, img.naturalHeight);
                        ctx.font = '16px "ＭＳ Ｐゴシック"';
                        ctx.strokeStyle = 'black';
                        for (const key in memo) {
                            if (memo.hasOwnProperty(key)) {
                                console.log(memo[key].text + '::' + memo[key].left + '::' + memo[key].top);
                                ctx.beginPath();
                                ctx.fillStyle = 'rgba(' + [240, 240, 240, 0.8] + ')';
                                ctx.fillRect(memo[key].left - 10 , memo[key].top - 10, 290, 30);
                                ctx.stroke();
                                ctx.fillStyle = 'black';
                                ctx.fillText(
                                    memo[key].text,
                                    memo[key].left,
                                    memo[key].top
                                );
                            }
                        }
                        const exImage: string = oc.toDataURL('image/jpg');
                        resolve(exImage);
                    };
                img.src = this.images[index].image;
            };
            loadImage();
        });
    }

    public getSingle(): string {
        return this.CaptureVideo();
    }
    public getElement(): void {
        this.editTag = <HTMLCanvasElement> document.getElementById(this.editTag);
        this.layerTag = <HTMLCanvasElement> document.getElementById(this.layerTag);
    }
    private CaptureVideo(): string {
        const oc = <HTMLCanvasElement> document.createElement('canvas');
        const ctx = oc.getContext('2d');
        oc.setAttribute('width', (this.targetTag.width).toString());
        oc.setAttribute('height', (this.targetTag.height).toString());
        ctx.drawImage(this.targetTag, 0, 0, this.targetTag.width, this.targetTag.height);
        const img = oc.toDataURL('image/jpg');
        return img;
    }

    private CaputureEdit(target: any): string {
        const oc = <HTMLCanvasElement> document.createElement('canvas');
        const ctx = oc.getContext('2d');
        oc.setAttribute('width', (target.width).toString());
        oc.setAttribute('height', (target.height).toString());
        ctx.drawImage(target, 0, 0, target.width, target.height);
        const img = oc.toDataURL('image/jpg');
        return img;
    }
}

export class Tag {
    text: string;
    top: number;
    left: number;
}
