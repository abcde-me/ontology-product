import React, { useState } from 'react';
import { Radio } from '@arco-design/web-react';
import AgentProvider from './compontents/AgentProvider';
import Header from './compontents/header';
import Content from './compontents/content';
import Interference from './compontents/Interference';
function ConfigurationPage(props) {
  const [selectedValue, setSelectedValue] = useState('true');
  const handleSelectedValueChange = (newValue) => {
    setSelectedValue(newValue);
  };
  return (
    <AgentProvider>
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <Header
          selectedValue={selectedValue}
          onSelectedValueChange={handleSelectedValueChange}
        />

        {/* Content */}
        {selectedValue === 'true' ? (
          <Content
            className="flex-1"
            // selectedValue={selectedValue}
            // onSelectedValueChange={handleSelectedValueChange}
          />
        ) : (
          <Interference></Interference>
        )}
      </div>
    </AgentProvider>
  );
}
export default ConfigurationPage;
