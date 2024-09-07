import { BinarizationFilter, GaussianBlurFilter, ImageCanvas } from './natsume-image';
import { useEffect, useRef, useState } from 'react';

let imageCanvas: ImageCanvas | null = null;
const filter = new GaussianBlurFilter();
const bFilter = new BinarizationFilter(0.8);

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

            imageCanvas.addFilter(bFilter);
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
            <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={filter.Radius}
                onChange={(e) => {
                    filter.Radius = Number(e.target.value);
                    imageCanvas?.forceUpdate();
                    setRefresh((prev) => prev + 1);
                }}
            />

            <input
                type="range"
                min="1"
                max="10"
                value={filter.Iteration}
                onChange={(e) => {
                    filter.Iteration = Number(e.target.value);
                    imageCanvas?.forceUpdate();
                    setRefresh((prev) => prev + 1);
                }}
            />

            <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={filter.DownScale}
                onChange={(e) => {
                    filter.DownScale = Number(e.target.value);
                    imageCanvas?.forceUpdate();
                    setRefresh((prev) => prev + 1);
                }}
            />

            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={bFilter.Threshold}
                onChange={(e) => {
                    bFilter.Threshold = Number(e.target.value);
                    imageCanvas?.forceUpdate();
                    setRefresh((prev) => prev + 1);
                }}
            />

            <button
                onClick={() => {
                    // 下载的图片尺寸要先设置为原始图片尺寸
                    imageCanvas?.updateSize(imgRef.current!.naturalWidth, imgRef.current!.naturalHeight);
                    imageCanvas?.getImageSrc().then((src) => {
                        console.log(src);
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
