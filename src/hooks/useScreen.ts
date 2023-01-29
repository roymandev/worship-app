import { atomScreenSettings } from '@/stores/screenStore';
import { useAtom } from 'jotai';

const useScreen = () => {
  const [settings, setSettings] = useAtom(atomScreenSettings);

  function changeSetting<T extends keyof typeof settings>(
    key: T,
    newValue:
      | (typeof settings)[T]
      | ((prevValue: (typeof settings)[T]) => (typeof settings)[T]),
  ) {
    setSettings((prevValue) => {
      const nextValue = { ...prevValue };
      nextValue[key] =
        typeof newValue === 'function' ? newValue(prevValue[key]) : newValue;
      return nextValue;
    });
  }

  return { settings, setSettings, changeSetting };
};

export default useScreen;
