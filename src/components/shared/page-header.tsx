import type { FC, ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

const PageHeader: FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6">
      <h1 className="font-headline text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h1>
      {children}
    </div>
  );
};

export default PageHeader;
