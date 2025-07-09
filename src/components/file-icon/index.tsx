import React from 'react';
import DocIcon from '@/assets/file/doc-icon.svg';
import ExeIcon from '@/assets/file/exe-icon.svg';
import ApkIcon from '@/assets/file/apk-icon.svg';
import RarIcon from '@/assets/file/rar-icon.svg';
// import JpgIcon from '@/assets/file/jpg-icon.svg';
import M4aIcon from '@/assets/file/m4a-icon.svg';
import Mp4Icon from '@/assets/file/mp4-icon.svg';
import PdfIcon from '@/assets/file/pdf-icon.svg';
import PptIcon from '@/assets/file/ppt-icon.svg';
import TxtIcon from '@/assets/file/txt-icon.svg';
import EpubIcon from '@/assets/file/epub-icon.svg';
import BucketIcon from '@/assets/file/bucket-icon.svg';
import DmgIcon from '@/assets/file/dmg-icon.svg';
import TorrentIcon from '@/assets/file/torrent-icon.svg';
import './index.css';

enum FileType {
  doc = 'doc',
  docx = 'docx',
  jpg = 'jpg',
  m4a = 'm4a',
  mp4 = 'mp4',
  pdf = 'pdf',
  ppt = 'ppt',
  pptx = 'pptx',
  text = 'text',
  txt = 'txt',
  wav = 'wav',
  exe = 'exe',
  bucket = 'bucket',
  dmg = 'dmg',
  torrent = 'torrent',
  apk = 'apk',
  rar = 'rar',
  epub = 'epub'
}

export default function getFileIcon(file_type: string) {
  switch (file_type) {
    case FileType.doc:
      return <DocIcon className="icon-size" />;
    case FileType.docx:
      return <DocIcon className="icon-size" />;
    case FileType.exe:
      return <ExeIcon className="icon-size" />;
    case FileType.apk:
      return <ApkIcon className="icon-size" />;
    case FileType.bucket:
      return <BucketIcon className="icon-size" />;
    case FileType.dmg:
      return <DmgIcon className="icon-size" />;
    case FileType.torrent:
      return <TorrentIcon className="icon-size" />;
    case FileType.apk:
      return <ApkIcon className="icon-size" />;
    case FileType.rar:
      return <RarIcon className="icon-size" />;
    // case FileType.jpg:
    //   return <JpgIcon />;
    case FileType.m4a:
      return <M4aIcon className="icon-size" />;
    case FileType.mp4:
      return <Mp4Icon className="icon-size" />;
    case FileType.pdf:
      return <PdfIcon className="icon-size" />;
    case FileType.ppt:
      return <PptIcon className="icon-size" />;
    case FileType.pptx:
      return <PptIcon className="icon-size" />;
    case FileType.text:
      return <TxtIcon className="icon-size" />;
    case FileType.txt:
      return <TxtIcon className="icon-size" />;
    case FileType.wav:
      return <Mp4Icon className="icon-size" />;
    case FileType.epub:
      return <EpubIcon className="icon-size" />;
    default:
      return <DocIcon className="icon-size" />;
  }
}
