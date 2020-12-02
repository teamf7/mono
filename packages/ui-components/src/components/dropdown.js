import React, { useState } from 'react';
import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';

export default function DropdownMenu({ items }) {
  const [show, setShow] = useState(false);

  const menuItems = items.map((item, index) => {
    return (
      <div
        className="menu__item"
        key={item.id + '-' + index}
        onClick={item.onClick}
      >
        {item.display}
      </div>
    );
  });

  return (
    <div className="menu">
      <div className="menu__items" style={{ display: show ? 'block' : 'none' }}>
        {menuItems}
      </div>
      <Icon
        className={`icon icon-menu ${show ? 'icon-menu-active' : ''}`}
        path={mdiDotsVertical}
        onClick={() => setShow(!show)}
      />
    </div>
  );
}