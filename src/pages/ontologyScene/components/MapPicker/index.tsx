import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { Form, Input, Message, Spin, Tooltip } from '@arco-design/web-react';
import {
  IconLoading,
  IconLocation,
  IconSearch
} from '@arco-design/web-react/icon';
import AMapLoader from '@amap/amap-jsapi-loader';
import styles from './index.module.scss';
import { SelectWithNoData } from '@/components/new-no-data-comps';
import { FormItem, OntoModal } from '@/pages/ontologyScene/components';

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

interface MapPickerRequest {
  getPopupContainer?: () => Element;
  onChange?: (value: GeoPoint) => void;
  value?: GeoPoint;
}

interface MapPickerModalState {
  request?: MapPickerRequest;
  requestId: number;
  visible: boolean;
}

const A_MAP_KEY = 'dc84b21bcd19ba6f62782df7349d7a8c';
const A_MAP_SECURITY = '6f410a598a5d10d836148c2743fdde1d';
const MAP_CONTAINER_ID = 'globalMapPickerContainer';
const DEFAULT_CENTER: [number, number] = [116.397428, 39.90923];

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

const getDisplayValue = (point?: GeoPoint) => {
  if (!point) return undefined;
  const { lng, lat } = point;
  return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
};

let modalState: MapPickerModalState = {
  visible: false,
  requestId: 0
};
const modalListeners = new Set<() => void>();
let modalHost: HTMLDivElement | null = null;
let modalMounted = false;

const emitModalState = () => {
  modalListeners.forEach((listener) => listener());
};

const updateModalState = (patch: Partial<MapPickerModalState>) => {
  modalState = {
    ...modalState,
    ...patch
  };
  emitModalState();
};

const subscribeModalState = (listener: () => void) => {
  modalListeners.add(listener);
  return () => {
    modalListeners.delete(listener);
  };
};

const useMapPickerModalState = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribeModalState(() => {
      forceUpdate((value) => value + 1);
    });
  }, []);

  return modalState;
};

const ensureMapPickerModalHost = () => {
  if (typeof document === 'undefined') return;

  if (!modalHost) {
    modalHost = document.createElement('div');
    modalHost.setAttribute('data-map-picker-host', 'true');
    document.body.appendChild(modalHost);
  }

  if (!modalMounted) {
    ReactDOM.render(<GlobalMapPickerModal />, modalHost);
    modalMounted = true;
  }
};

const openGlobalMapPicker = (request: MapPickerRequest) => {
  ensureMapPickerModalHost();
  updateModalState({
    request,
    requestId: modalState.requestId + 1,
    visible: true
  });
};

const closeGlobalMapPicker = () => {
  updateModalState({
    visible: false
  });
};

const clearGlobalMapPickerRequest = () => {
  updateModalState({
    request: undefined
  });
};

// 全局单例地图弹窗
const GlobalMapPickerModal = () => {
  const [form] = Form.useForm();
  const { visible, request, requestId } = useMapPickerModalState();
  const listRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const AMapRef = useRef<any>();
  const mapRef = useRef<any>();
  const markerRef = useRef<any>();
  const placeSearchRef = useRef<any>();
  const mapClickBoundRef = useRef(false);
  const mapInitializingRef = useRef(false);

  const [showPointList, setShowPointList] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([]);
  const [currentPoint, setCurrentPoint] = useState<GeoPoint | undefined>();

  const clearMarker = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  }, []);

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
        form.setFields({
          geoPoint: {
            error: undefined,
            value: getDisplayValue(point)
          }
        });
      });
      markerRef.current.setMap(mapRef.current);
    }
    return markerRef.current;
  }, [form]);

  const updateMarker = useCallback(
    (point: GeoPoint, moveMap = true) => {
      const marker = ensureMarker();
      if (!marker) return;
      marker.setPosition([point.lng, point.lat]);
      if (moveMap) {
        mapRef.current?.setCenter([point.lng, point.lat]);
      }
      setCurrentPoint(point);
      form.setFields({
        geoPoint: {
          error: undefined,
          value: getDisplayValue(point)
        }
      });
    },
    [ensureMarker, form]
  );

  const resetPointState = useCallback(
    (point?: GeoPoint) => {
      setCurrentPoint(point);
      form.setFields({
        geoPoint: {
          error: undefined,
          value: getDisplayValue(point)
        }
      });

      if (!mapRef.current) return;

      if (point) {
        updateMarker(point, true);
        return;
      }

      clearMarker();
      mapRef.current.setCenter(DEFAULT_CENTER);
      mapRef.current.setZoom?.(11);
    },
    [clearMarker, form, updateMarker]
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

  const initMapControls = useCallback(() => {
    const AMap = AMapRef.current;
    if (!AMap || placeSearchRef.current) return;
    AMap.plugin('AMap.PlaceSearch', () => {
      placeSearchRef.current = new AMap.PlaceSearch({
        pageSize: 100,
        pageIndex: 1,
        city: '全国'
      });
    });
    AMap.plugin('AMap.ToolBar', () => {
      const toolBar = new AMap.ToolBar();
      mapRef.current?.addControl(toolBar);
    });
    AMap.plugin('AMap.Scale', () => {
      const scale = new AMap.Scale();
      mapRef.current?.addControl(scale);
    });
    AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation();
      mapRef.current?.addControl(geolocation);
    });
  }, []);

  const initMap = useCallback(async () => {
    if (mapRef.current) return true;
    if (mapInitializingRef.current) return false;

    mapInitializingRef.current = true;
    setLoadingMap(true);
    try {
      const AMap = await loadAmap();
      const container = document.querySelector(`#${MAP_CONTAINER_ID}`);
      if (!container || !container.isConnected) {
        return false;
      }

      AMapRef.current = AMap;
      mapRef.current = new AMap.Map(MAP_CONTAINER_ID, {
        zoom: 11,
        center: currentPoint
          ? [currentPoint.lng, currentPoint.lat]
          : DEFAULT_CENTER,
        viewMode: '2D'
      });
      bindMapClick();
      initMapControls();
      if (currentPoint) {
        updateMarker(currentPoint, true);
      }
      setMapReady(true);
      return true;
    } catch (err) {
      console.error('地图加载失败:', err);
      Message.error('地图加载失败，请检查网络或密钥配置');
      return false;
    } finally {
      mapInitializingRef.current = false;
      setLoadingMap(false);
    }
  }, [bindMapClick, currentPoint, initMapControls, updateMarker]);

  useEffect(() => {
    setSearchOptions([]);
    setShowPointList(false);
    resetPointState(request?.value);
  }, [request?.value?.lat, request?.value?.lng, requestId, resetPointState]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    let timerId = 0;
    let frameId = 0;

    const ensureMapReady = async () => {
      const container = document.querySelector(`#${MAP_CONTAINER_ID}`);
      if (!container || !container.isConnected) {
        frameId = window.requestAnimationFrame(ensureMapReady);
        return;
      }

      if (container.clientWidth === 0 || container.clientHeight === 0) {
        timerId = window.setTimeout(ensureMapReady, 50);
        return;
      }

      if (!mapRef.current) {
        const initialized = await initMap();
        if (!initialized || !mapRef.current) {
          timerId = window.setTimeout(ensureMapReady, 50);
          return;
        }
      }

      if (cancelled) return;

      frameId = window.requestAnimationFrame(() => {
        mapRef.current?.resize?.();
        if (currentPoint) {
          updateMarker(currentPoint, true);
        }
      });
    };

    ensureMapReady();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
    };
  }, [currentPoint, initMap, updateMarker, visible]);

  const handleSearch = useCallback((keyword: string) => {
    const q = keyword?.trim();
    if (!q) {
      setSearchOptions([]);
      setShowPointList(false);
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
        .map((poi: any) => ({
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
      setShowPointList(true);
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
      setShowPointList(false);
    },
    [updateMarker]
  );

  const handleConfirm = () => {
    form
      .validate()
      .then(() => {
        if (currentPoint) {
          request?.onChange?.(currentPoint);
        }
        closeGlobalMapPicker();
      })
      .catch(console.error);
  };

  useEffect(() => {
    const clickInArea = (e: any) => {
      if (mapContainerRef.current?.contains(e.target)) return;
      setShowPointList(false);
    };
    document.addEventListener('click', clickInArea);
    return () => document.removeEventListener('click', clickInArea);
  }, []);

  return (
    <OntoModal
      title="选择坐标"
      visible={visible}
      onCancel={closeGlobalMapPicker}
      onOk={handleConfirm}
      maskStyle={{
        display: visible ? 'block' : 'none'
      }}
      style={{ width: 900, height: 600 }}
      getChildrenPopupContainer={(node) => node.parentElement || document.body}
      afterClose={() => {
        form.resetFields();
        clearGlobalMapPickerRequest();
      }}
      className={styles.modal}
      getPopupContainer={request?.getPopupContainer || (() => document.body)}
    >
      <div className={'flex h-full w-full flex-col'}>
        <div className={styles.toolbar}>
          <Form autoFocus={false} autoComplete={'off'} form={form}>
            <FormItem
              required={true}
              label={'已选坐标：'}
              className={'mb-0'}
              layout={'horizontal'}
              field="geoPoint"
              rules={[
                {
                  required: true,
                  message: '请点击地图选择坐标'
                }
              ]}
            >
              <Input disabled placeholder={'请点击地图选择坐标'} />
            </FormItem>
          </Form>
        </div>

        <div className={styles.body}>
          <div className={styles.mapWrapper}>
            <div
              ref={mapContainerRef}
              className={styles.mapContainer}
              id={MAP_CONTAINER_ID}
            />
            {loadingMap && (
              <div className={styles.loadingMask}>
                <Spin />
                <div className={styles.loadingText}>地图加载中...</div>
              </div>
            )}
            <SelectWithNoData
              popupVisible={showPointList}
              showSearch
              allowClear
              placeholder="请输入关键词"
              disabled={!mapReady || loadingMap}
              loading={searchLoading}
              options={searchOptions}
              filterOption={false}
              arrowIcon={<IconSearch />}
              onSearch={handleSearch}
              dropdownRender={(menu) => {
                return <div ref={listRef}>{menu}</div>;
              }}
              onChange={(val: string) => {
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
      </div>
    </OntoModal>
  );
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
  const openModal = useCallback(() => {
    if (disabled) return;
    openGlobalMapPicker({
      value,
      onChange,
      getPopupContainer
    });
  }, [disabled, getPopupContainer, onChange, value]);

  const handleClear = () => {
    onChange?.(undefined as any);
  };

  return (
    <Tooltip
      disabled={disabled}
      content="选择坐标"
      getPopupContainer={getPopupContainer}
    >
      <Input
        className={classNames(styles.input, className)}
        style={style}
        readOnly
        value={getDisplayValue(value)}
        placeholder={placeholder}
        disabled={disabled}
        allowClear
        onClear={handleClear}
        suffix={
          <Tooltip content="选择坐标" getPopupContainer={getPopupContainer}>
            <IconLocation onClick={openModal} />
          </Tooltip>
        }
        onClick={openModal}
      />
    </Tooltip>
  );
};
