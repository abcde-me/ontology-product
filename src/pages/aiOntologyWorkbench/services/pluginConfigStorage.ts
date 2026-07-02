import {
  DEFAULT_PLUGIN_CONFIG,
  type PluginConfigStore,
  type WorkbenchPluginItem
} from '../types/pluginConfig';

const STORAGE_PREFIX = 'ai_onto_workbench_plugin_config_v1';

const storageKey = (ontologyModelId: number) =>
  `${STORAGE_PREFIX}_${ontologyModelId}`;

const mergeWithDefaults = (store: PluginConfigStore): PluginConfigStore => {
  const defaultMap = new Map(
    DEFAULT_PLUGIN_CONFIG.plugins.map((item) => [item.type, item])
  );

  const plugins = DEFAULT_PLUGIN_CONFIG.plugins.map((defaultItem) => {
    const saved = store.plugins.find((item) => item.type === defaultItem.type);

    if (!saved) {
      return { ...defaultItem };
    }

    return {
      ...defaultItem,
      ...saved,
      config: {
        ...defaultItem.config,
        ...saved.config
      }
    };
  });

  store.plugins.forEach((item) => {
    if (!defaultMap.has(item.type)) {
      plugins.push(item);
    }
  });

  return { plugins };
};

export const loadPluginConfigStore = (
  ontologyModelId: number
): PluginConfigStore => {
  try {
    const raw = window.localStorage.getItem(storageKey(ontologyModelId));
    if (!raw) {
      const initial = mergeWithDefaults(DEFAULT_PLUGIN_CONFIG);
      savePluginConfigStore(ontologyModelId, initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as PluginConfigStore;
    if (!parsed?.plugins?.length) {
      return mergeWithDefaults(DEFAULT_PLUGIN_CONFIG);
    }

    return mergeWithDefaults(parsed);
  } catch {
    return mergeWithDefaults(DEFAULT_PLUGIN_CONFIG);
  }
};

export const savePluginConfigStore = (
  ontologyModelId: number,
  store: PluginConfigStore
) => {
  window.localStorage.setItem(
    storageKey(ontologyModelId),
    JSON.stringify(store)
  );
};

export const updatePluginConfigStore = (
  ontologyModelId: number,
  store: PluginConfigStore,
  plugins: WorkbenchPluginItem[]
): PluginConfigStore => {
  const next = mergeWithDefaults({ plugins });
  savePluginConfigStore(ontologyModelId, next);
  return next;
};

export const getEnabledPlugins = (store: PluginConfigStore | null) => {
  return (store?.plugins || []).filter((item) => item.enabled);
};

export const buildPluginConfigPayload = (store: PluginConfigStore | null) => {
  const enabledPlugins = getEnabledPlugins(store);

  return {
    enabled_plugins: enabledPlugins.map((item) => item.type),
    plugin_config: enabledPlugins.map((item) => ({
      type: item.type,
      config: item.config
    }))
  };
};
