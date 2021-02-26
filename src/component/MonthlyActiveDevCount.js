import React, {useState, useEffect} from "react";
import { Spinner, Row} from "react-bootstrap";
import ReactEcharts from "echarts-for-react";

import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [date, setDate] = useState([]);
  const [monthlyActiveDeveloperCount, setCount] = useState({});

  useEffect(() => {
    fetch("https://mixpanel.com/api/2.0/insights?bookmark_id=11445773", {
      "method": "GET",
      "headers": {
        "Accept": "application/json",
        "Authorization": "Basic NzEwMGI4ZGM1MTE4NmFlZGRjZmQ5ZGU3ZGExNzExNjk6"
      }
    })
    .then(res => res.json())
    .then(
      (result) => {
        let res = result.series["Monthly Active User"]
        let date = Object.keys(res)
        date = date.map(d => d.slice(0,10))
        setDate(date)
        setCount(Object.values(res))
        setIsLoaded(true)
      },
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    )
    .catch(err => {
      console.error(err);
    });
  }, [])

  const chartStyle = {
    height: "480px",
    width: "100%"
  };

  const getOption = (title, date, data) => {
    return {
      title: {
        text: title,
      },
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
        show: true,
        color: "gray",
        backgroundColor: "rgba(218, 210, 250, 0.1)",
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: date,
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            lineStyle: {
              color: "white",
            },
          },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
          filterMode: "filter",
        },
        {
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: "monthly Developer",
          type: "line",
          lineStyle: {
            color: "#4f44e0",
            width: 2,
          },
          symbol: "circle",
          itemStyle: {
            color: "#25272A",
          },
          data: data,
        },
      ],
    };
  };

  if (error) {
    return <Row>Error: {error.message}</Row>;
  } else if (!isLoaded || date.length === 0) {
    return <Row>
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            </Row>;
  } else {
    return (
      <Row>
        <h3>Monthly Active Developer(Internal) <Tooltip text={term.monthly_active_developer} /></h3>
        <ReactEcharts
          option={getOption(
            "",
            date,
            monthlyActiveDeveloperCount
          )}
          style={chartStyle}
        />
      </Row>
    );
  }
}