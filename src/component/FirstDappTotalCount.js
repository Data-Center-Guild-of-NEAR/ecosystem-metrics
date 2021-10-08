import React from 'react';
import ReactEcharts from 'echarts-for-react';

import firstDappTotal from '../history/first_dapp_count_dapp_total_10_06.json';

const dappCount = () => {
  let total = firstDappTotal.sort((v1, v2) => {
    return v2.count - v1.count;
  });
  total = total.slice(0, 10);
  const dappName = total.map((t) => t.name);
  let dappCount = total.map((t) => t.count);

  let height = 40 * total.length;

  const getOption = () => {
    return {
      grid: { containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: [
        {
          name: 'Users granted first on NEAR',
          type: 'value',
        },
      ],
      yAxis: [
        {
          type: 'category',
          data: dappName,
          inverse: true,
        },
      ],
      series: [
        {
          type: 'bar',
          data: dappCount,
        },
      ],
    };
  };

  return (
    <>
      <h2>Total First Dapp Count</h2>
      <p>collected until 2021-10-06</p>
      <ReactEcharts
        option={getOption()}
        style={{
          height: height.toString() + 'px',
          width: '100%',
        }}
      />
    </>
  );
};

export default dappCount;
