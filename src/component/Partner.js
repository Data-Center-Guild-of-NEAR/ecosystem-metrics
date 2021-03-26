import React from "react";

import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";
import { partner_dapp } from "../history/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => (
      <div>
        <h4>Deployed Partner DApp Count <Tooltip text={term.partner_count} /></h4>
        <h4><strong className="green">{partner_dapp["2021-03-22"]}</strong></h4>
      </div>
)