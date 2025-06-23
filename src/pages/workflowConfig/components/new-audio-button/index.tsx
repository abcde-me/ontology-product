import React, { useState } from 'react';
import { RiVolumeUpLine } from '@remixicon/react';
import { useTranslation } from 'react-i18next';
import Tooltip from '@/pages/workflowConfig/components/tooltip';
import { AudioPlayerManager } from '@/pages/workflowConfig/components/audio-btn/audio.player.manager';
import ActionButton, {
  ActionButtonState
} from '@/pages/workflowConfig/components/action-button';

type AudioBtnProps = {
  id?: string;
  voice?: string;
  value?: string;
};

type AudioState = 'initial' | 'loading' | 'playing' | 'paused' | 'ended';

const AudioBtn = ({ id, voice, value }: AudioBtnProps) => {
  const [audioState, setAudioState] = useState<AudioState>('initial');
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const params = {} as any;
  const pathname = { search: () => true } as any;
  const audio_finished_call = (event: string): any => {
    switch (event) {
      case 'ended':
        setAudioState('ended');
        break;
      case 'paused':
        setAudioState('ended');
        break;
      case 'loaded':
        setAudioState('loading');
        break;
      case 'play':
        setAudioState('playing');
        break;
      case 'error':
        setAudioState('ended');
        break;
    }
  };
  let url = '';
  let isPublic = false;

  if (params.token) {
    url = '/text-to-audio';
    isPublic = true;
  } else if (params.appId) {
    if (pathname.search('explore/installed') > -1)
      url = `/installed-apps/${params.appId}/text-to-audio`;
    else url = `/apps/${params.appId}/text-to-audio`;
  }
  const handleToggle = () => {
    if (audioState === 'playing' || audioState === 'loading') {
      setTimeout(() => setAudioState('paused'), 1);
      AudioPlayerManager.getInstance()
        .getAudioPlayer(url, isPublic, id, value, voice, audio_finished_call)
        .pauseAudio();
    } else {
      setTimeout(() => setAudioState('loading'), 1);
      AudioPlayerManager.getInstance()
        .getAudioPlayer(url, isPublic, id, value, voice, audio_finished_call)
        .playAudio();
    }
  };

  const tooltipContent = {
    initial: t('appApi.play'),
    ended: t('appApi.play'),
    paused: t('appApi.pause'),
    playing: t('appApi.playing'),
    loading: t('appApi.loading')
  }[audioState];

  return (
    <Tooltip popupContent={tooltipContent}>
      <ActionButton
        state={
          audioState === 'loading' || audioState === 'playing'
            ? ActionButtonState.Active
            : ActionButtonState.Default
        }
        onClick={handleToggle}
        disabled={audioState === 'loading'}
      >
        <RiVolumeUpLine className="h-4 w-4" />
      </ActionButton>
    </Tooltip>
  );
};

export default AudioBtn;
