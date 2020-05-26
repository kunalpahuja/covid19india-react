import {TIMESERIES_STATISTICS} from '../../constants';

import produce from 'immer';

const useTimeseries = (data) => {
  const getStatistic = (timeseries, date, statistic) => {
    switch (statistic) {
      case 'active':
        return (
          timeseries[date].confirmed -
          timeseries[date].recovered -
          timeseries[date].deceased
        );

      case 'tested':
        return timeseries[date].tested?.samples || 0;

      default:
        return timeseries[date][statistic];
    }
  };

  const getCumulativeStatisticArray = (discreteStatisticArray) => {
    return discreteStatisticArray.reduce(function (r, discreteStatisticArray) {
      r.push(((r.length && r[r.length - 1]) || 0) + discreteStatisticArray);
      return r;
    }, []);
  };

  const getDiscreteStatisticArray = (timeseries, statistic) => {
    let array = [];
    Object.keys(timeseries).map(
      (date) => (array = [...array, getStatistic(timeseries, date, statistic)])
    );
    return array;
  };

  Object.keys(data).forEach((stateCode) => {
    data[stateCode] = produce(data[stateCode], (draftState) => {
      draftState['statistics'] = produce(
        draftState['statistics'] || {cumulative: null, discrete: null},
        (draftStatistics) => {
          ['discrete', 'cumulative'].map((type) => {
            draftStatistics[type] = produce(
              draftStatistics[type] || {},
              (draftStatistic) => {
                TIMESERIES_STATISTICS.map((statistic) => {
                  if (type === 'discrete') {
                    draftStatistic[statistic] = getDiscreteStatisticArray(
                      data[stateCode].timeseries,
                      statistic
                    );
                  } else if (type === 'cumulative') {
                    draftStatistic[statistic] = getCumulativeStatisticArray(
                      draftStatistics['discrete'][statistic]
                    );
                  }
                });
              }
            );
          });
        }
      );
    });
  });

  return [data];
};

export default useTimeseries;
