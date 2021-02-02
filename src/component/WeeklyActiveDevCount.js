import React, {useState, useEffect} from "react";

import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [weeklyActiveDeveloperCount, setCount] = useState(null);

  useEffect(() => {
    fetch("https://mixpanel.com/api/2.0/insights?bookmark_id=11445540", {
      "method": "GET",
      "headers": {
        "Accept": "application/json",
        "Authorization": "Basic NzEwMGI4ZGM1MTE4NmFlZGRjZmQ5ZGU3ZGExNzExNjk6"
      }
    })
    .then(res => res.json())
    .then(
      (result) => {
        let res = result.series["Weekly Active User"]
        setIsLoaded(true);
        setCount(Object.values(res)[0]);
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    )
    .catch(err => {
      console.error(err);
    });
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <h4>Weekly Active Developer <Tooltip text={term.weekly_active_developer} /></h4>
        <h4><strong className="green">{weeklyActiveDeveloperCount}</strong></h4>
      </div>
    );
  }
}