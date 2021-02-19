import React from "react";

import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => (
      <div>
        <h4>Partner DApp Count <Tooltip text={term.partner_count} /></h4>
        <h4><strong className="green">6</strong></h4>
      </div>
)