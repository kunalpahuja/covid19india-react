import {useStore} from '../store';

import {format} from 'date-fns';
import React from 'react';

const Timeline = ({timelineIndex, setTimelineIndex}) => {
  const {data} = useStore();

  return (
    <div className="timeline">
      {Object.keys(data['TT'].timeseries)
        .reverse()
        .map((date, index) => (
          <div
            key={date}
            style={{
              color: timelineIndex === index ? '#6c757d' : '',
              fontSize: timelineIndex === index ? '2rem' : '',
            }}
            className="date"
            onClick={() => {
              setTimelineIndex(index);
            }}
          >
            {format(new Date(date), 'dd MMM')}
          </div>
        ))}
    </div>
  );
};

export default Timeline;
