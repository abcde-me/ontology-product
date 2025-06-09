import defaultSettings from '../settings.json';
export type GlobalState = {
  plugins?: {
    [namespace: string]: any;
  };
  globalVars: {
    entry: {
      entryFromUrl: any;
    };
  };
};
export interface PluginGlobalState {
  settings?: typeof defaultSettings;
  userInfo?: {
    name?: string;
    avatar?: string;
    job?: string;
    organization?: string;
    location?: string;
    email?: string;
    permissions: Record<string, string[]>;
  };
  userLoading?: boolean;
}

const initialState: PluginGlobalState = {
  settings: defaultSettings,
  userInfo: {
    permissions: {}
  }
};

export default function store(state = initialState, action) {
  switch (action.type) {
    case 'update-settings': {
      const { settings } = action.payload;
      return {
        ...state,
        settings
      };
    }
    case 'update-userInfo': {
      const { userInfo = initialState.userInfo, userLoading } = action.payload;
      return {
        ...state,
        userLoading,
        userInfo
      };
    }
    default:
      return state;
  }
}
