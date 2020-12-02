import React from 'react';

export default function Preloader({loading}) {
 
  if (!loading) {
    return null;
  }
  return (<div className="preloader"><div className="loading">Загрузка</div></div >);
}
