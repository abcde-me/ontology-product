import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import classNames from 'classnames';
import {
  Button,
  Input,
  Message,
  Modal,
  Spin,
  Tooltip
} from '@arco-design/web-react';
import {
  IconLoading,
  IconLocation,
  IconRefresh,
  IconSearch
} from '@arco-design/web-react/icon';
import AMapLoader from '@amap/amap-jsapi-loader';
import styles from './index.module.scss';
import { SelectWithNoData } from '@/components/new-no-data-comps';
import { FormItem } from '@/pages/ontologyScene/componens';

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode?: string;
    };
  }
}

interface GeoPoint {
  lng: number;
  lat: number;
}

interface PoiItem {
  name: string;
  address?: string;
  location?: {
    lng: number;
    lat: number;
  };
}

interface SearchOption {
  label: string;
  value: string;
  poi: PoiItem;
}

interface MapPickerProps extends CustomFormItemCompProps<GeoPoint> {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  getPopupContainer?: () => Element;
}

// TODO: 请补充自己的高德 Key 与安全码
const A_MAP_KEY = 'dc84b21bcd19ba6f62782df7349d7a8c';
const A_MAP_SECURITY = '6f410a598a5d10d836148c2743fdde1d';

// const amapLoader: Promise<any> | null = null;
const loadAmap = async () => {
  window._AMapSecurityConfig = {
    securityJsCode: A_MAP_SECURITY
  };
  return AMapLoader.load({
    key: A_MAP_KEY,
    version: '2.0',
    plugins: [
      'AMap.PlaceSearch',
      'AMap.ToolBar',
      'AMap.Scale',
      'AMap.Geolocation'
    ]
  });
};

export const MapPicker: React.FC<MapPickerProps> = ({
  value,
  onChange,
  placeholder = '请选择坐标',
  disabled,
  className,
  style,
  getPopupContainer
}) => {
  const AMapRef = useRef<any>();
  const [visible, setVisible] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([]);
  const [currentPoint, setCurrentPoint] = useState<GeoPoint | undefined>(value);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>();
  const markerRef = useRef<any>();
  const placeSearchRef = useRef<any>();
  const mapClickBoundRef = useRef(false);

  const getDisplayValue = () => {
    if (!currentPoint) return undefined;
    const { lng, lat } = currentPoint;
    return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
  };

  const ensureMarker = useCallback(() => {
    if (!mapRef.current || !AMapRef.current) return null;
    if (!markerRef.current) {
      markerRef.current = new AMapRef.current.Marker({
        draggable: true
      });
      markerRef.current.on('dragend', (e: any) => {
        const point = {
          lng: e.lnglat.lng,
          lat: e.lnglat.lat
        };
        setCurrentPoint(point);
      });
      markerRef.current.setMap(mapRef.current);
    }
    return markerRef.current;
  }, []);

  const updateMarker = useCallback(
    (point: GeoPoint, moveMap = true) => {
      const marker = ensureMarker();
      if (!marker) return;
      marker.setPosition([point.lng, point.lat]);
      if (moveMap) {
        mapRef.current?.setCenter([point.lng, point.lat]);
      }
      setCurrentPoint(point);
    },
    [ensureMarker]
  );
  const bindMapClick = useCallback(() => {
    if (!mapRef.current || mapClickBoundRef.current) return;
    const handleClick = (e: any) => {
      const point = {
        lng: e.lnglat.lng,
        lat: e.lnglat.lat
      };
      updateMarker(point);
    };
    mapRef.current.on('click', handleClick);
    mapClickBoundRef.current = true;
  }, [updateMarker]);

  const initMapControls = () => {
    const AMap = AMapRef.current;
    if (!AMap || placeSearchRef.current) return;
    AMap.plugin('AMap.PlaceSearch', () => {
      placeSearchRef.current = new AMap.PlaceSearch({
        pageSize: 100, //每页结果数,默认10
        pageIndex: 1, //请求页码，默认1
        city: '全国'
      });
    });
    AMap.plugin('AMap.ToolBar', function () {
      const toolBar = new AMap.ToolBar(); //缩放工具条实例化
      mapRef.current.addControl(toolBar);
    });
    AMap.plugin('AMap.Scale', function () {
      const scale = new AMap.Scale(); //缩放工具条实例化
      mapRef.current.addControl(scale);
    });
    AMap.plugin('AMap.Geolocation', function () {
      const geolocation = new AMap.Geolocation(); //缩放工具条实例化
      mapRef.current.addControl(geolocation);
    });
  };
  const initMap = useCallback(async () => {
    if (mapRef.current) return;
    setLoadingMap(true);
    try {
      const AMap = await loadAmap();
      AMapRef.current = AMap;
      const center = currentPoint
        ? [currentPoint.lng, currentPoint.lat]
        : [116.397428, 39.90923];
      mapRef.current = new AMap.Map(mapContainerRef.current, {
        zoom: 11,
        center,
        viewMode: '2D'
      });
      bindMapClick();
      initMapControls();
      if (currentPoint) {
        updateMarker(currentPoint, true);
      }
      setMapReady(true);
    } catch (err) {
      Message.error('地图加载失败，请检查网络或密钥配置');
    } finally {
      setLoadingMap(false);
    }
  }, [bindMapClick, currentPoint, initMapControls, updateMarker]);

  // 地图未就绪时不弹框，确保弹出即有可用实例
  const openModal = useCallback(() => {
    if (disabled || !mapReady) return;
    setVisible(true);
    requestAnimationFrame(() => {
      mapRef.current?.resize?.();
      if (currentPoint) {
        updateMarker(currentPoint, true);
      }
    });
  }, [currentPoint, disabled, initMap, updateMarker, mapReady]);

  // 同步外部受控值
  useEffect(() => {
    if (!value) return setCurrentPoint(undefined);
    if (value && [value.lat, value.lng].every((n) => typeof n === 'number')) {
      setCurrentPoint(value);
      if (mapRef.current) {
        updateMarker(value, false);
      }
    }
  }, [value?.lng, value?.lat, updateMarker]);

  // 组件挂载即加载地图，避免弹框打开时再等待
  useEffect(() => {
    initMap();
  }, []);

  // 远程搜索 POI，结果注入 Select options
  const handleSearch = useCallback((keyword: string) => {
    const q = keyword?.trim();
    // setSearchKeyword(keyword);
    if (!q) {
      setSearchOptions([]);
      return;
    }
    if (!placeSearchRef.current) {
      Message.warning('地图未准备好，请稍后重试');
      return;
    }
    setSearchLoading(true);
    placeSearchRef.current.search(q, (status: string, result: any) => {
      setSearchLoading(false);
      if (status !== 'complete' || !result?.poiList?.pois?.length) {
        setSearchOptions([]);
        return;
      }
      const options: SearchOption[] = result.poiList.pois
        .filter((poi: any) => poi.location)
        .map((poi: any, idx: number) => ({
          label: `${poi.name}${poi.address ? ' - ' + poi.address : ''}`,
          value: `${poi.location.lng},${poi.location.lat}`,
          poi: {
            name: poi.name,
            address: poi.address,
            location: {
              lng: poi.location.lng,
              lat: poi.location.lat
            }
          }
        }));
      setSearchOptions(options);
    });
  }, []);

  const handleSelectPoi = useCallback(
    (poi: PoiItem) => {
      if (!poi.location) return;
      const point = {
        lng: poi.location.lng,
        lat: poi.location.lat
      };
      updateMarker(point, true);
      mapRef.current?.setZoom?.(15);
    },
    [updateMarker]
  );

  const handleConfirm = () => {
    if (currentPoint) {
      onChange?.(currentPoint);
    }
    setVisible(false);
  };

  const handleClear = () => {
    setCurrentPoint(undefined);
    onChange?.(undefined as any);
  };

  const handleModalClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Tooltip content="选择坐标" disabled={disabled}>
        <Input
          className={classNames(styles.input, className)}
          style={style}
          readOnly
          value={getDisplayValue()}
          placeholder={placeholder}
          disabled={disabled || loadingMap || !mapReady}
          allowClear
          onClear={handleClear}
          suffix={
            !mapReady || loadingMap ? (
              <IconLoading />
            ) : (
              <IconLocation onClick={openModal} />
            )
          }
          onClick={openModal}
        />
      </Tooltip>

      <Modal
        title="选择坐标"
        visible={visible}
        onCancel={handleModalClose}
        onOk={handleConfirm}
        okButtonProps={{ disabled: !currentPoint }}
        unmountOnExit={false}
        mountOnEnter={false}
        style={{ width: 900 }}
        getPopupContainer={getPopupContainer}
      >
        <div className={styles.toolbar}>
          <FormItem
            required
            label={'已选坐标：'}
            labelCol={{ span: 3 }}
            layout={'horizontal'}
            className={'mb-0'}
          >
            <Input
              readOnly
              value={getDisplayValue()}
              placeholder={'请点击地图选择坐标'}
            />
          </FormItem>
        </div>

        <div className={styles.body}>
          <div className={styles.mapWrapper}>
            <div ref={mapContainerRef} className={styles.mapContainer} />
            <SelectWithNoData
              showSearch
              allowClear
              placeholder="请输入关键词"
              loading={searchLoading}
              options={searchOptions}
              filterOption={false}
              arrowIcon={<IconSearch />}
              onSearch={handleSearch}
              onChange={(val: string, option) => {
                if (!val) return;
                const [lng, lat] = val.split(',');
                handleSelectPoi({
                  name: '',
                  location: {
                    lng: +lng,
                    lat: +lat
                  }
                });
              }}
              className={styles['search-place']}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
