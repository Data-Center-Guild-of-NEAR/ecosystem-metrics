/* eslint-disable import/no-anonymous-default-export */
import React from "react"

export default ({text}) => {
return <div className="tooltip"> ⍰ 
        <span className="tooltiptext">{text}</span>
        <style>{`
        /* Tooltip container */
        .tooltip {
          position: relative;
          display: inline-block;
          border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
        }
        
        /* Tooltip text */
        .tooltip .tooltiptext {
          visibility: hidden;
          width: 180px;
          background-color: #757474;
          color: #f2f0f0;
          text-align: center;
          padding: 15px;
          border-radius: 6px;
         
          /* Position the tooltip text - see examples below! */
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -90px; 
          z-index: 1;
        }
        
        /* Show the tooltip text when you mouse over the tooltip container */
        .tooltip:hover .tooltiptext {
          visibility: visible;
        }
        `}</style>
      </div> 
}