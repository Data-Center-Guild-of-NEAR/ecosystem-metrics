import React, {useState, useEffect} from "react";
import { Spinner, Row } from "react-bootstrap";
import ReactEcharts from "echarts-for-react";

import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [monthlyDeveloper, setMonthlyCount] = useState(null);
  const [weeklyDeveloper, setWeeklyCount] = useState(null);
  const [developer, setCount] = useState([]);
  const [date, setDate] = useState([]);

  const getTotalUnique = (res) => {
    let result = res.map(dev => dev.developerList).reduce((dev, current) => current.concat(dev), [])
    return result.filter((dev, index) => {
          return result.indexOf(dev) === index
      }).filter((dev) => !dev.includes("dependabot"))
  }

  const getUnique = (res) => res.filter((dev, index) => {
                    return res.indexOf(dev) === index
                }).filter((dev) => !dev.includes("dependabot"))

  useEffect(() => {

    let today = new Date(); 
    // today
    let dd = today.getUTCDate(); 
    let mm = today.getUTCMonth()+1; 
    let yyyy = today.getUTCFullYear();

    //week ago
    let before7Daysdate = new Date(today.setDate(dd - 7));
    let dd7ago = before7Daysdate.getUTCDate(); 
    let mm7ago = before7Daysdate.getUTCMonth()+1; 
    let yyyy7ago = before7Daysdate.getUTCFullYear();
    let month = mm7ago < 10 ? '-0' : '-';
    let day = dd7ago < 10 ? '-0' : '-';
    let date7ago = yyyy7ago + month + mm7ago  + day + dd7ago;

    let developer_list = "developer_list_by_"+ mm + "_" + dd + "_" + yyyy;
    console.log(developer_list)
    fetch("https://rt.pipedream.com/sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer 632a32ecca7db94e4a46fc11f0418a88"
      },
      body:  JSON.stringify({
        query: `SELECT date, developer_set FROM ${developer_list} order by date`,
      })
    })
    .then(res => res.json())
    .then(
      (result) => {
        let res = result.resultSet.Rows
        res = res.map(data => ({date: data.Data[0].VarCharValue, developerList: data.Data[1].VarCharValue.slice(1,-2).split(", ")}))
        res = res.slice(1, res.length)
        //get total
        let weekIndex = res.findIndex(r => r.date === date7ago)
        let weekRes = res.slice(weekIndex, res.length)
        let monthlyDeveloper = getTotalUnique(res)
        let weeklyDeveloper = getTotalUnique(weekRes)
        //get list
        res = Object.values(res.reduce((a,c) => {
          a[c.date] = Object.assign(a[c.date] || {}, c)
          return a
        }, {}))
        let developer = res.map(r => getUnique(r.developerList))
        setCount(developer.map(d => d.length))
        setDate(res.map(r => r.date))
        setMonthlyCount(monthlyDeveloper.length)
        setWeeklyCount(weeklyDeveloper.length)
        setIsLoaded(true);
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

  const chartStyle = {
    height: "480px",
    width: "90%"
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
          name: "Daily Developer",
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
          </Row>;;
  }
  return (
      <div>
        <h3>Monthly Active Developer(External) <Tooltip text={term.monthly_github_developer} />: <strong className="green">{monthlyDeveloper}</strong></h3>
        <h3>Weekly Active Developer(External) <Tooltip text={term.weekly_github_developer} />: <strong className="green">{weeklyDeveloper}</strong></h3>
        <ReactEcharts
              option={getOption(
                "Active Developer(External)",
                date,
                developer
              )}
              style={chartStyle}
            />
      </div>
  );
}