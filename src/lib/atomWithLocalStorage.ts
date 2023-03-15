import { atom } from 'jotai';

type SetStateAction<Value> = Value | ((prev: Value) => Value);

export const atomWithLocalStorage = <Value>(
  key: string,
  initialValue: Value,
  validate: (value: Value) => Value,
) => {
  const getInitialValue = (): Value => {
    const storageValue = JSON.parse(localStorage.getItem(key) ?? 'null');
    return storageValue === null ? initialValue : validate(storageValue);
  };

  const baseAtom = atom(getInitialValue());

  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: SetStateAction<Value>) => {
      const nextValue =
        typeof update === 'function'
          ? (update as (prev: Value) => Value)(get(baseAtom))
          : update;

      set(baseAtom, nextValue);

      localStorage.setItem(key, JSON.stringify(nextValue));
    },
  );

  return derivedAtom;
};
