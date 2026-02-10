import React from 'react';
import { isNil } from 'lodash-es';

export const SafeTableCell = (props: { value?: React.Key }) => {
  return <>{isNil(props.value) ? '-' : props.value}</>;
};
