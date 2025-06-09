import * as React from 'react';
import { shallow, configure } from 'enzyme';
import Example from '../../pages/example/index';
import { Card } from '@arco-design/web-react';
import * as Adapter from '@wojtekmaj/enzyme-adapter-react-17';

const AdapterCon = typeof Adapter === 'function' ? Adapter : Adapter.default;
configure({ adapter: new AdapterCon() });

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('Example', () => {
  it('Example page should have Card', () => {
    const wrapper = shallow(<Example />);
    expect(wrapper.find(Card).exists()).toBeTruthy();
  });
});
