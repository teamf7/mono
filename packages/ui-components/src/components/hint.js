import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';
import { mdiCommentProcessingOutline } from '@mdi/js';
import Icon from '@mdi/react';
import '../../styles/ui-components/hint.sass';

export default function Hint({ text }) {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  const outerClick = useCallback((e) => {
    if (target.current && !target.current.parentNode.contains(e.target)) {
      setShow(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', outerClick, true);
    return () => {
      document.removeEventListener('click', outerClick, true);
    };
  }, []);

  return (
    <div className="hint">
      <Icon
        className="icon"
        path={mdiCommentProcessingOutline}
        ref={target}
        onClick={(event) => {
          event.stopPropagation();
          setShow(!show);
        }}
      />
      <Overlay target={target.current} show={show} placement="bottom">
        {(props) => <Tooltip {...props}>{text}</Tooltip>}
      </Overlay>
    </div>
  );
}
