import React from 'react';

export const Container = ({ pageInfo, ...otherProps }) => {
  if (!pageInfo) {
    return null;
  }
  const Component = pageInfo.component;
  const title = pageInfo?.title;

  return (
    <div className="form-body">
      <Component title={title} {...otherProps} />
    </div>
  );
}