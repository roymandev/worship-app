import { atomScreenSettings } from '@/stores/screenStore';
import { useAtom } from 'jotai';
import { useId, useState } from 'react';
import BaseInput from '../BaseInput';
import Screen from '../Screen';
import BaseModal, { ModalProps } from './BaseModal';

const ModalSettings = (props: ModalProps) => {
  const formId = useId();

  const [previewText, setPreviewText] = useState(
    'Kuingin hati yang suci murni, Yang memancarkan terang sejati',
  );

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
  };

  const [screenSettings, setScreenSettings] = useAtom(atomScreenSettings);

  const changeScreenSize = <
    Key extends keyof typeof screenSettings.mainSize,
    Val extends (typeof screenSettings.mainSize)[Key],
  >(
    key: Key,
    value: Val,
  ) =>
    setScreenSettings((prevSettings) => ({
      ...prevSettings,
      mainSize: {
        ...prevSettings.mainSize,
        [key]: value,
      },
    }));

  return (
    <BaseModal title="Settings" className="max-w-2xl" {...props}>
      <div className="grid grid-cols-2 gap-1 p-1">
        <form className="space-y-2 pl-1" onSubmit={onSubmit}>
          <fieldset className="flex items-center">
            <label htmlFor={formId + 'text-size'} className="flex-1">
              Text Size
            </label>
            <BaseInput
              id={formId + 'text-size'}
              type="number"
              className="w-20 px-2"
              value={screenSettings.mainSize.fontSize}
              onChange={(e) =>
                changeScreenSize('fontSize', parseInt(e.target.value))
              }
            />
          </fieldset>

          <fieldset className="flex items-center">
            <label htmlFor={formId + 'line-height'} className="flex-1">
              Line height
            </label>
            <BaseInput
              id={formId + 'line-height'}
              type="number"
              className="w-20 px-2"
              value={screenSettings.mainSize.lineHeight}
              onChange={(e) =>
                changeScreenSize('lineHeight', parseInt(e.target.value))
              }
            />
          </fieldset>

          <fieldset className="flex items-center justify-between">
            <label htmlFor={formId + 'padding'} className="flex-1">
              Padding
            </label>
            <BaseInput
              id={formId + 'padding'}
              type="number"
              className="w-20 px-2"
              value={screenSettings.mainSize.padding}
              onChange={(e) =>
                changeScreenSize('padding', parseInt(e.target.value))
              }
            />
          </fieldset>

          <fieldset className="flex items-center gap-1">
            <label htmlFor={formId + 'text-color'} className="flex flex-1">
              Text Color
            </label>
            <BaseInput
              id={formId + 'text-color'}
              type="color"
              className="w-10 p-1"
              value={screenSettings.textColor}
              onChange={(e) =>
                setScreenSettings((prevSettings) => ({
                  ...prevSettings,
                  textColor: e.target.value,
                }))
              }
            />
            <BaseInput
              value={screenSettings.textColor}
              className="w-20 px-2 font-mono"
              onChange={(e) =>
                setScreenSettings((prevSettings) => ({
                  ...prevSettings,
                  textColor: e.target.value,
                }))
              }
            />
          </fieldset>
        </form>

        <div className="flex h-80 flex-col gap-1">
          <Screen line={{ text: previewText }} />
          <BaseInput
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default ModalSettings;
