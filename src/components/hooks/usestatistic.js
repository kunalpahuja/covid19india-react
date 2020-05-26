import {useStore} from '../../store';

import {useMemo, useCallback} from 'react';

const useStatistic = (stateCode, timelineIndex) => {
  const {data} = useStore();

  const dates = useMemo(() => {
    return Object.keys(data['TT'].timeseries);
  }, [data]);

  const getStatistic = useCallback(
    (statistic, type) => {
      return data[stateCode].statistics[type][statistic][
        dates.length - 1 - timelineIndex
      ];
    },
    [data, dates, stateCode, timelineIndex]
  );

  return [
    data[stateCode].statistics,
    dates.slice(0, dates.length - timelineIndex),
    getStatistic,
  ];
};

export default useStatistic;
