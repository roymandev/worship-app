import { useEffect, useRef, useState } from 'react';

const useDebouncedValue = <T = unknown>(value: T, wait: number) => {
  const [_value, setValue] = useState(value);
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const cancel = () => clearTimeout(timeoutIdRef.current);

  useEffect(() => {
    cancel();
    timeoutIdRef.current = setTimeout(() => setValue(value), wait);

    return cancel;
  }, [value, wait]);

  return _value;
};

export default useDebouncedValue;
