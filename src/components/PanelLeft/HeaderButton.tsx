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
        '-mb-px flex items-center gap-3 border-b border-zinc-600 px-3',
        active
          ? 'border-sky-500 bg-zinc-600/50 text-white'
          : 'hover:bg-zinc-700/50',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
