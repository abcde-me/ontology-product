import React from 'react';
import Container from './components/Container';
import OrgProvider from './components/OrgProvider';

export default function Member() {
  return (
    <OrgProvider>
      <Container />
    </OrgProvider>
  );
}
