import { GreyScaleFilter, ImageCanvas } from './natsume-image';
import { useEffect, useRef, useState } from 'react';

let imageCanvas: ImageCanvas | null = null;
const filter = new GreyScaleFilter(0);

const App = () => {
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [_refresh, setRefresh] = useState(0);

    useEffect(() => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) {
            console.error('Unable to find img or canvas element');
            return;
        }

        img.onload = () => {
            imageCanvas = ImageCanvas.createInstance(canvas, img, img.width, img.height);
            if (!imageCanvas) {
                return;
            }

            imageCanvas.addFilter(filter);
            setRefresh((prev) => prev + 1);
        };

        const resizeCallback = () => {
            imageCanvas?.updateSize(img.width, img.height);
        };
        const observer = new ResizeObserver(resizeCallback);
        observer.observe(img);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div>
            <img
                src="/0.png"
                alt=""
                style={{
                    width: '50%',
                }}
                ref={imgRef}
            />
            <canvas
                ref={canvasRef}
                style={{
                    width: '50%',
                }}
            />
            <button
                onClick={() => {
                    filter.GreyScale += 0.1;
                    // 手动触发更新
                    imageCanvas?.forceUpdate();
                }}
                disabled={!imageCanvas}
            >
                Add GreyScale
            </button>

            <button
                onClick={() => {
                    filter.GreyScale -= 0.1;
                    // 手动触发更新
                    imageCanvas?.forceUpdate();
                }}
                disabled={!imageCanvas}
            >
                Reduce GreyScale
            </button>

            <button
                onClick={() => {
                    // 下载的图片尺寸要先设置为原始图片尺寸
                    imageCanvas?.updateSize(imgRef.current!.naturalWidth, imgRef.current!.naturalHeight);
                    imageCanvas?.getImageSrc().then((src) => {
                        const a = document.createElement('a');
                        a.href = src;
                        a.download = 'image.png';
                        a.click();

                        // 下载完成后，再恢复为显示图片尺寸
                        imageCanvas?.updateSize(imgRef.current!.width, imgRef.current!.height);
                    });
                }}
                disabled={!imageCanvas}
            >
                Save
            </button>
        </div>
    );
};

export default App;
