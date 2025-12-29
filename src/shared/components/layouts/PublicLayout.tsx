import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <>
      <Outlet /> {/* Pages like Home, Events, EventDetails render here */}
    </>
  );
};

export default PublicLayout;