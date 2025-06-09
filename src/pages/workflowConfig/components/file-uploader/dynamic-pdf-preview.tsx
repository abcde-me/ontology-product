import { lazy } from 'react';
import React from 'react'

const PdfPreview = lazy(() => import('./pdf-preview'));

const DynamicPdfPreview = 
  (props: any) => {
    return <PdfPreview {...props}/>;
  }


export default DynamicPdfPreview
