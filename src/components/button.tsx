import React from 'react';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...rest }) => {
  const baseClasses = 
    'rounded-2xl border-2 border-black bg-white px-6 py-3 font-bold uppercase text-black ' +
    'transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] ' +
    'hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] ' +
    'active:translate-y-[0px] active:rounded-2xl active:shadow-none';

  return (
    <button className={`${baseClasses} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;