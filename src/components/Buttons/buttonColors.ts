export type ButtonColors = typeof BUTTON_TEXT_COLORS;

export const BUTTON_TEXT_COLORS = {
  gray: 'text-slate-700 hover:bg-slate-200 focus:bg-slate-400/30 disabled:text-slate-400 disabled:bg-slate-200/20',
  blue: 'text-blue-700 hover:bg-blue-200 focus:bg-blue-400/30 disabled:text-blue-400 disabled:bg-blue-200/20',
  red: 'text-red-700 hover:bg-red-200 focus:bg-red-400/30 disabled:text-red-300 disabled:bg-red-200/20',
  green:
    'text-green-700 hover:bg-green-200 focus:bg-green-400/30 disabled:text-green-400 disabled:bg-green-200/20',
  purple:
    'text-purple-700 hover:bg-purple-200 focus:bg-purple-400/30 disabled:text-purple-400 disabled:bg-purple-200/20',
  yellow:
    'text-amber-700 hover:bg-amber-200 focus:bg-amber-400/30 disabled:text-amber-400 disabled:bg-amber-200/20',
};

export const BUTTON_COLORS: ButtonColors = {
  gray: 'bg-slate-200/30 border-slate-300 hover:border-slate-500 focus:border-slate-500 disabled:border-slate-200',
  blue: 'bg-blue-200/30 border-blue-300 hover:border-blue-500 focus:border-blue-500 disabled:border-blue-200',
  red: 'bg-red-200/30 border-red-300 hover:border-red-500 focus:border-red-500 disabled:border-red-100',
  green:
    'bg-green-200/30 border-green-300 hover:border-green-500 focus:border-green-500 disabled:border-green-200',
  purple:
    'bg-purple-200/30 border-purple-300 hover:border-purple-500 focus:border-purple-500 disabled:border-purple-200',
  yellow:
    'bg-amber-200/30 border-amber-300 hover:border-amber-500 focus:border-amber-500 disabled:border-amber-200',
};
