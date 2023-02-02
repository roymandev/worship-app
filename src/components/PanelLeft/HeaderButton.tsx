import { twclsx } from '@/lib/twclsx';

type HeaderButtonProps = {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

export const HeaderButton = ({
  children,
  active,
  onClick,
}: HeaderButtonProps) => {
  return (
    <button
      className={twclsx(
        '-mb-px flex items-center gap-3 border-b border-zinc-700 px-3',
        active
          ? 'border-sky-600 bg-sky-700/50 text-white'
          : 'hover:bg-zinc-700/50',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
