import {
    BinarizationFilter,
    BoxBlurFilter,
    ContrastFilter,
    GaussianBlurFilter,
    GrainyBlurFilter,
    GreyScaleFilter,
    HueFilter,
    IFilter,
    ImageCanvas,
    RevertFilter,
    SaturationFilter,
    SobelEdgeDetectionFilter,
    TintFilter,
} from './natsume-image';
import { useEffect, useRef, useState } from 'react';

let imageCanvas: ImageCanvas | null = null;
const filterList = [
    {
        name: '高斯模糊',
        filter: GaussianBlurFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const gaussianFilter = filter as GaussianBlurFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    高斯模糊
                    <br />
                    <label>
                        Radius:
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.1"
                            value={gaussianFilter.Radius}
                            onChange={(e) => {
                                gaussianFilter.Radius = parseFloat(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                    <label>
                        Iteration:
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={gaussianFilter.Iteration}
                            onChange={(e) => {
                                gaussianFilter.Iteration = parseInt(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                    <label>
                        Downscale:
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={gaussianFilter.DownScale}
                            onChange={(e) => {
                                gaussianFilter.DownScale = parseInt(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                </div>
            );
        },
    },
    {
        name: '二值化',
        filter: BinarizationFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const binarizationFilter = filter as BinarizationFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    二值化
                    <br />
                    <label>
                        Threshold:
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={binarizationFilter.Threshold}
                            onChange={(e) => {
                                binarizationFilter.Threshold = parseFloat(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                </div>
            );
        },
    },
    {
        name: '灰度',
        filter: GreyScaleFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const greyScaleFilter = filter as GreyScaleFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    灰度
                    <br />
                    <label>
                        Threshold:
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={greyScaleFilter.GreyScale}
                            onChange={(e) => {
                                greyScaleFilter.GreyScale = parseFloat(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                </div>
            );
        },
    },
    {
        name: '反色',
        filter: RevertFilter,
        component: (_props: { filter: IFilter }) => {
            return (
                <div>
                    反色
                    <br />
                </div>
            );
        },
    },
    {
        name: '色调',
        filter: TintFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const tintFilter = filter as TintFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    色调
                    <br />
                    <input
                        type="color"
                        value={
                            '#' +
                            Math.floor(tintFilter.Tint.r).toString(16).padStart(2, '0') +
                            Math.floor(tintFilter.Tint.g).toString(16).padStart(2, '0') +
                            Math.floor(tintFilter.Tint.b).toString(16).padStart(2, '0')
                        }
                        onChange={(e) => {
                            tintFilter.Tint = {
                                r: parseInt(e.target.value.slice(1, 3), 16),
                                g: parseInt(e.target.value.slice(3, 5), 16),
                                b: parseInt(e.target.value.slice(5, 7), 16),
                            };
                            imageCanvas?.forceUpdate();
                            setRefresh((prev) => prev + 1);
                        }}
                    />
                </div>
            );
        },
    },
    {
        name: '对比度',
        filter: ContrastFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const contrastFilter = filter as ContrastFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    对比度
                    <br />
                    <label>
                        Contrast:
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.01"
                            value={contrastFilter.Contrast}
                            onChange={(e) => {
                                contrastFilter.Contrast = parseFloat(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                </div>
            );
        },
    },
    {
        name: '饱和度',
        filter: SaturationFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const saturationFilter = filter as SaturationFilter;
            const [_refresh, setRefresh] = useState(0);

            return (
                <div>
                    饱和度
                    <br />
                    <label>
                        Saturation:
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.01"
                            value={saturationFilter.Saturation}
                            onChange={(e) => {
                                saturationFilter.Saturation = parseFloat(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                </div>
            );
        },
    },
    {
        name: '色相',
        filter: HueFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const hueFilter = filter as HueFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    色相
                    <br />
                    <label>
                        Hue:
                        <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            value={hueFilter.Hue}
                            onChange={(e) => {
                                hueFilter.Hue = parseInt(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                </div>
            );
        },
    },
    {
        name: '盒状模糊',
        filter: BoxBlurFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const boxBlurFilter = filter as BoxBlurFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    盒状模糊
                    <br />
                    <label>
                        Radius:
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.1"
                            value={boxBlurFilter.Radius}
                            onChange={(e) => {
                                boxBlurFilter.Radius = parseFloat(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                    <label>
                        Iteration:
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={boxBlurFilter.Iteration}
                            onChange={(e) => {
                                boxBlurFilter.Iteration = parseInt(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                    <label>
                        Downscale:
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={boxBlurFilter.DownScale}
                            onChange={(e) => {
                                boxBlurFilter.DownScale = parseInt(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                </div>
            );
        },
    },
    {
        name: '粒状模糊',
        filter: GrainyBlurFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const grainyBlurFilter = filter as GrainyBlurFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    粒状模糊
                    <br />
                    <label>
                        Radius:
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.1"
                            value={grainyBlurFilter.Radius}
                            onChange={(e) => {
                                grainyBlurFilter.Radius = parseFloat(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                    <label>
                        Iteration:
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={grainyBlurFilter.Iteration}
                            onChange={(e) => {
                                grainyBlurFilter.Iteration = parseInt(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                    <label>
                        Downscale:
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={grainyBlurFilter.DownScale}
                            onChange={(e) => {
                                grainyBlurFilter.DownScale = parseInt(e.target.value);
                                imageCanvas?.forceUpdate();
                                setRefresh((prev) => prev + 1);
                            }}
                        />
                    </label>
                </div>
            );
        },
    },
    {
        name: '边缘检测',
        filter: SobelEdgeDetectionFilter,
        component: (props: { filter: IFilter }) => {
            const { filter } = props;
            const sobelEdgeDetectionFilter = filter as SobelEdgeDetectionFilter;
            const [_refresh, setRefresh] = useState(0);
            return (
                <div>
                    边缘检测
                    <br />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={sobelEdgeDetectionFilter.Intensity}
                        onChange={(e) => {
                            sobelEdgeDetectionFilter.Intensity = parseFloat(e.target.value);
                            imageCanvas?.forceUpdate();
                            setRefresh((prev) => prev + 1);
                        }}
                    />
                    <input
                        type="color"
                        value={
                            '#' +
                            Math.floor(sobelEdgeDetectionFilter.EdgeColor.r).toString(16).padStart(2, '0') +
                            Math.floor(sobelEdgeDetectionFilter.EdgeColor.g).toString(16).padStart(2, '0') +
                            Math.floor(sobelEdgeDetectionFilter.EdgeColor.b).toString(16).padStart(2, '0')
                        }
                        onChange={(e) => {
                            sobelEdgeDetectionFilter.EdgeColor = {
                                r: parseInt(e.target.value.slice(1, 3), 16),
                                g: parseInt(e.target.value.slice(3, 5), 16),
                                b: parseInt(e.target.value.slice(5, 7), 16),
                            };
                            imageCanvas?.forceUpdate();
                            setRefresh((prev) => prev + 1);
                        }}
                    />
                    <input
                        type="color"
                        value={
                            '#' +
                            Math.floor(sobelEdgeDetectionFilter.BackgroundColor.r).toString(16).padStart(2, '0') +
                            Math.floor(sobelEdgeDetectionFilter.BackgroundColor.g).toString(16).padStart(2, '0') +
                            Math.floor(sobelEdgeDetectionFilter.BackgroundColor.b).toString(16).padStart(2, '0')
                        }
                        onChange={(e) => {
                            sobelEdgeDetectionFilter.BackgroundColor = {
                                r: parseInt(e.target.value.slice(1, 3), 16),
                                g: parseInt(e.target.value.slice(3, 5), 16),
                                b: parseInt(e.target.value.slice(5, 7), 16),
                            };
                            imageCanvas?.forceUpdate();
                            setRefresh((prev) => prev + 1);
                        }}
                    />
                    <input
                        type="checkbox"
                        checked={sobelEdgeDetectionFilter.EdgeOnly}
                        onChange={(e) => {
                            sobelEdgeDetectionFilter.EdgeOnly = e.target.checked;
                            imageCanvas?.forceUpdate();
                            setRefresh((prev) => prev + 1);
                        }}
                    />
                </div>
            );
        },
    },
];

type TFilterComponent = {
    filter: IFilter;
    component: (props: { filter: IFilter }) => JSX.Element;
}[];

const App = () => {
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [_refresh, setRefresh] = useState(0);
    const [renderList, setRenderList] = useState<TFilterComponent>([]);
    useEffect(() => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) {
            console.error('Unable to find img or canvas element');
            return;
        }

        img.onload = () => {
            if (imageCanvas) {
                return;
            }

            imageCanvas = ImageCanvas.createInstance(canvas, img, img.width, img.height);
            if (!imageCanvas) {
                return;
            }

            setRefresh((prev) => prev + 1);
        };

        const resizeCallback = () => {
            imageCanvas?.updateSize(img.width, img.height);
        };
        const observer = new ResizeObserver(resizeCallback);
        observer.observe(img);

        return () => {
            observer.disconnect();
            imageCanvas = null;
        };
    }, []);

    return (
        <div>
            <img
                src={`./mako.png`}
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
                    height: 'auto',
                }}
            />

            <div
                style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '10px',
                }}
            >
                {filterList.map((item, index) => {
                    const Filter = item.filter;
                    return (
                        <button
                            key={index}
                            onClick={() => {
                                if (!imageCanvas) {
                                    return;
                                }

                                const filter = new Filter();
                                imageCanvas.addFilter(filter);
                                setRenderList([
                                    ...renderList,
                                    {
                                        filter: filter,
                                        component: item.component,
                                    },
                                ]);
                                setRefresh((prev) => prev + 1);
                            }}
                            disabled={!imageCanvas}
                        >
                            {item.name}
                        </button>
                    );
                })}
            </div>

            {renderList.length > 0 &&
                renderList.map((item, index) => {
                    const Filter = item.filter;
                    const Component = item.component;
                    return (
                        <div key={index}>
                            <Component filter={Filter} />
                        </div>
                    );
                })}

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

            <button
                onClick={() => {
                    imageCanvas?.clearFilters();
                    setRenderList([]);
                    setRefresh((prev) => prev + 1);
                }}
                disabled={!imageCanvas}
            >
                reset
            </button>

            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.src = e.target?.result as string;
                        img.onload = () => {
                            imgRef.current!.src = img.src;

                            imageCanvas?.updateImage(img);
                            imageCanvas?.updateSize(img.width, img.height);
                        };
                    };
                    reader.readAsDataURL(file);
                }}
            />
        </div>
    );
};

export default App;
