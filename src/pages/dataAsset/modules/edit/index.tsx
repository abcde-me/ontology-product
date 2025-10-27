import React from 'react';
import { useParams } from 'react-router-dom';
import DataAssetFormContainer from '../../components/DataAssetForm/DataAssetFormContainer';

export default function DataAssetEdit() {
  const { id } = useParams<{ id: string }>();
  return <DataAssetFormContainer isEditMode={true} id={id} />;
}
