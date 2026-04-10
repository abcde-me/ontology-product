import MenuObjectIcon from '../../assets/menu-object.svg';
import MenuLinkIcon from '../../assets/menu-link.svg';
import MenuAttributeIcon from '../../assets/menu-attribute.svg';
import MenuBehaviorIcon from '../../assets/menu-behavior.svg';
import MenuFunctionIcon from '../../assets/menu-function.svg';
import MenuBehaviorLogIcon from '../../assets/menu-log.svg';

export enum ONTOLOGY_SCENE_MENU_ITEM_KEYS {
  OBJECT_TYPE = 'objectType', // 对象类型
  ATTRIBUTES = 'attributes', // 属性
  LINKS = 'links', // 链接
  BEHAVIOR_ACTIONS = 'behaviorActions', // 行为动作
  FUNCTIONS = 'functions', // 函数
  BEHAVIOR_LOG = 'behaviorLog' // 执行记录
}

export const ONTOLOGY_SCENE_KEYS2ICON = {
  [ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE]: MenuObjectIcon,
  [ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS]: MenuLinkIcon,
  [ONTOLOGY_SCENE_MENU_ITEM_KEYS.ATTRIBUTES]: MenuAttributeIcon,
  [ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS]: MenuBehaviorIcon,
  [ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS]: MenuFunctionIcon,
  [ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_LOG]: MenuBehaviorLogIcon
};
