import React, { useState } from 'react';
import { ReactReader } from 'react-reader';

export const Test = () => {
  const [location, setLocation] = useState<string | number>(0);
  return <ReactReader url="" location={location} locationChanged={setLocation} />;
};
