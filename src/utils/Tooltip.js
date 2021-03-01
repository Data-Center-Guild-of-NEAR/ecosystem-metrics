/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useRef } from "react"
import { Overlay, Tooltip, Button } from "react-bootstrap";

export default ({text}) => {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  return <>
          <Button ref={target} onClick={() => setShow(!show)} style={{background:"transparent", border: "none"}}>
            <img src="/icon-view-source.svg" alt="?" className="icon"/> 
          </Button>
          <Overlay target={target.current} show={show} placement="right">
            <Tooltip id="overlay-example" >
              {text}
            </Tooltip>
        </Overlay>  
          <style>{`
          .btn-primary {
            padding: 0;
          }
          .icon {
            height: 14px;
            margin-top: -3px;
          }
          `}</style>
        </> 
}