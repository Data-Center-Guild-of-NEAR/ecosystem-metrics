import React from 'react';
import ReactEcharts from 'echarts-for-react';

import firstDappDailyTotal from '../history/first_dapp_count_daily_total_8_23.json';

const DailyTotalCountFristDapp = () => {
  const chartStyle = {
    height: '480px',
    width: '90%',
  };

  const getOption = (date, data) => {
    return {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        show: true,
        color: 'gray',
        backgroundColor: 'rgba(218, 210, 250, 0.1)',
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: date,
        },
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: 'white',
            },
          },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          filterMode: 'filter',
        },
        {
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: 'Active Accounts',
          type: 'line',
          lineStyle: {
            color: '#4f44e0',
            width: 2,
          },
          symbol: 'circle',
          itemStyle: {
            color: '#25272A',
          },
          data: data,
        },
      ],
    };
  };

  let total = firstDappDailyTotal.sort(
    (v1, v2) => new Date(v1.date) - new Date(v2.date)
  );
  let date = total.map((t) => t.date);
  let count = total.map((t) => t.count);
  return (
    <>
      <h2>Daily Total First Time Dapp granted By User</h2>
      <p>collected until 2021-08-23</p>
      <ReactEcharts option={getOption(date, count)} style={chartStyle} />
    </>
  );
};

export default DailyTotalCountFristDapp;
