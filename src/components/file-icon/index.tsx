import React from 'react';
import DocIcon from '@/assets/file/doc-icon.svg';
import ExeIcon from '@/assets/file/exe-icon.svg';
import ApkIcon from '@/assets/file/apk-icon.svg';
import RarIcon from '@/assets/file/rar-icon.svg';
import JpgIcon from '@/assets/file/jpg-icon.svg';
import M4aIcon from '@/assets/file/m4a-icon.svg';
import Mp4Icon from '@/assets/file/mp4-icon.svg';
import PdfIcon from '@/assets/file/pdf-icon.svg';
import PptIcon from '@/assets/file/ppt-icon.svg';
import TxtIcon from '@/assets/file/txt-icon.svg';
import EpubIcon from '@/assets/file/epub-icon.svg';
import BucketIcon from '@/assets/file/bucket-icon.svg';
import DmgIcon from '@/assets/file/dmg-icon.svg';
import TorrentIcon from '@/assets/file/torrent-icon.svg';
import DefaultIcon from '@/assets/file/default-icon.svg';
import JsonIcon from '@/assets/file/json-icon.svg';
import MarkDownIcon from '@/assets/file/markdown-icon.svg';
import './index.css';
import { FileType } from '@/utils/type';

export default function getFileIcon(file_type: string) {
  switch (file_type) {
    case FileType.doc:
      return <DocIcon className="icon-size" />;
    case FileType.docx:
      return <DocIcon className="icon-size" />;
    case FileType.word:
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
    case FileType.jpg:
      return <JpgIcon className="icon-size" />;
    case FileType.jpeg:
      return <JpgIcon className="icon-size" />;
    case FileType.png:
      return <JpgIcon className="icon-size" />;
    case FileType.m4a:
      return <M4aIcon className="icon-size" />;
    case FileType.mp4:
      return <Mp4Icon className="icon-size" />;
    case FileType.mov:
      return <Mp4Icon className="icon-size" />;
    case FileType.mkv:
      return <Mp4Icon className="icon-size" />;
    case FileType.wmv:
      return <Mp4Icon className="icon-size" />;
    case FileType.avi:
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
    case FileType.m4a:
      return <M4aIcon className="icon-size" />;
    case FileType.wav:
      return <M4aIcon className="icon-size" />;
    case FileType.mp3:
      return <M4aIcon className="icon-size" />;
    case FileType.flv:
      return <M4aIcon className="icon-size" />;
    case FileType.ogg:
      return <M4aIcon className="icon-size" />;
    case FileType.aac:
      return <M4aIcon className="icon-size" />;
    case FileType.flac:
      return <M4aIcon className="icon-size" />;
    case FileType.webm:
      return <M4aIcon className="icon-size" />;
    case FileType.epub:
      return <EpubIcon className="icon-size" />;
    case FileType.json:
      return <JsonIcon className="icon-size" />;
    case FileType.markdown:
      return <MarkDownIcon className="icon-size" />;
    case FileType.md:
      return <MarkDownIcon className="icon-size" />;
    default:
      return <DefaultIcon className="icon-size" />;
  }
}
