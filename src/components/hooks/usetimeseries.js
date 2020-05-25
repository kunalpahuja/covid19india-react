import {TIMESERIES_STATISTICS} from '../../constants';
import {useStore} from '../../store';

import produce from 'immer';
import {useMemo, useCallback} from 'react';

function useTimeseries(timeseries, chartType = 'cumulative', timelineIndex) {
  const {data, dispatch} = useStore();

  const getCumulativeStatisticArray = (discreteStatisticArray) => {
    return discreteStatisticArray.reduce(function (r, discreteStatisticArray) {
      r.push(((r.length && r[r.length - 1]) || 0) + discreteStatisticArray);
      return r;
    }, []);
  };

  const getStatistic = useCallback(
    (highlightedDate, statistic, chartType) => {
      switch (chartType) {
        case 'cumulative':
          const index = Object.keys(timeseries).findIndex(
            (date) => date === highlightedDate
          );

          switch (statistic) {
            case 'active':
              return (
                statistics[chartType].confirmed[index] -
                statistics[chartType].recovered[index] -
                statistics[chartType].deceased[index]
              );

            default:
              return statistics[chartType][statistic][index];
          }

        default:
          switch (statistic) {
            case 'active':
              return (
                timeseries[highlightedDate].confirmed -
                timeseries[highlightedDate].recovered -
                timeseries[highlightedDate].deceased
              );

            case 'tested':
              return timeseries[highlightedDate].tested?.samples || 0;

            default:
              return timeseries[highlightedDate][statistic];
          }
      }
    },
    // eslint-disable-next-line
    [timeseries]
  );

  const statistics = useMemo(
    (prevStatistics) => {
      const getDiscreteStatisticArray = (statistic) => {
        let array = [];
        Object.keys(timeseries).map(
          (date) => (array = [...array, getStatistic(date, statistic)])
        );
        return array;
      };

      prevStatistics = produce(prevStatistics || {}, (draftStatistics) => {
        TIMESERIES_STATISTICS.map((statistic) => {
          switch (chartType) {
            case 'cumulative':
              draftStatistics['cumulative'] = produce(
                draftStatistics['cumulative'] || {},
                (draftCumulative) => {
                  draftCumulative[statistic] = getCumulativeStatisticArray(
                    getDiscreteStatisticArray(statistic)
                  );
                }
              );

            case 'discrete':
              draftStatistics['discrete'] = produce(
                draftStatistics['discrete'] || {},
                (draftDiscrete) => {
                  draftDiscrete[statistic] = getDiscreteStatisticArray(
                    statistic
                  );
                }
              );
          }
        });
      });

      return prevStatistics;
    },
    [chartType, getStatistic, timeseries]
  );

  return [
    statistics,
    Object.keys(timeseries).slice(0, timelineIndex + 1),
    getStatistic,
  ];
}

export default useTimeseries;
