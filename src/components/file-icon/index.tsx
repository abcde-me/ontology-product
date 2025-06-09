import React from 'react'
import PdfIcon from '@/assets/file/pdf.svg';
import TxtIcon from '@/assets/file/txt.svg';


export default function FileIcon(props: any) {
  const { filename = '', ...rest } = props;
  const className = 'size-[16px]';

  const renderIcon = () => {
    if (filename.endsWith('.pdf'))
      return <PdfIcon className={className} {...rest} />
    else if (filename.endsWith('.txt'))
      return <TxtIcon className={className} {...rest} />
    else return <PdfIcon className={className} {...rest} />
  }

  return renderIcon()
}