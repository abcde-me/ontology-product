import React from 'react';
import { useParams } from 'react-router-dom';
import DataAssetForm from '../../components/form';

export default function DataAssetEdit() {
  const { id } = useParams<{ id: string }>();
  return <DataAssetForm isEditMode={true} id={id} />;
}
