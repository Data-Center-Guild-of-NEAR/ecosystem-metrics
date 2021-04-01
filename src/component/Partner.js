import React from "react";

import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => (
      <div>
        <h4>Partner DApp Community: <Tooltip text={term.partner_count} /></h4>
        <ul style={{textAlign: 'left', marginLeft: '30px'}}>
          <li>
            <a href="https://paras.id/" target="_blank" rel="noreferrer">paras</a>
          </li>
          <li>
            <a href="https://www.mintgate.app/" target="_blank" rel="noreferrer">Mintgate</a>
          </li>
          <li>
            <a href="https://somniumspace.com/" target="_blank" rel="noreferrer">Somniun Space</a>
          </li>
          <li>
            <a href="https://wificoin.com/" target="_blank" rel="noreferrer">PESA</a>
          </li>
          <li>
            <a href="https://www.trailit.co/" target="_blank" rel="noreferrer">Trailit</a>
          </li>
          <li>
            <a href="https://www.verida.io/" target="_blank" rel="noreferrer">Verida</a>
          </li>
          <li>
            <a href="https://supraoracles.com/" target="_blank" rel="noreferrer">Supra Oracles</a>
          </li>
        </ul>
      </div>
)