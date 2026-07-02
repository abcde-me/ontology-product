import { LinkDirection } from '../../../../types/link';
import {
  mapFormLinkTypeToLinkDirection,
  mapLinkDirectionToFormLinkType
} from './constants';

export const createEmptyLinkPairItem = () => ({
  name: '',
  id: '',
  linkDirection: LinkDirection.UNIDIRECTIONAL,
  sourceObjectType: undefined as number | undefined,
  targetObjectType: undefined as number | undefined,
  targetObjectAttribute: undefined as string | undefined
});

export { mapLinkDirectionToFormLinkType, mapFormLinkTypeToLinkDirection };
