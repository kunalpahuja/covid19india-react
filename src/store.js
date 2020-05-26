import useTimeseries from './components/hooks/usetimeseries';
import {INITIAL_DATA} from './constants';
import {fetcher} from './utils/commonfunctions';

import React, {createContext, useContext, useReducer, useEffect} from 'react';
import useSWR from 'swr';

const StoreContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'update':
      return action.data;

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export const StoreProvider = ({children}) => {
  const [data, dispatch] = useReducer(reducer, INITIAL_DATA);

  return (
    <StoreContext.Provider value={{data, dispatch}}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

export const useData = () => {
  const {data, dispatch} = useStore();

  const {data: swrData} = useSWR('http://localhost:3001/db', fetcher, {
    suspense: true,
    refreshInterval: 100000,
    revalidateOnFocus: false,
  });

  const [parsedData] = useTimeseries(swrData);

  useEffect(() => {
    dispatch({type: 'update', data: parsedData});
  }, [dispatch, parsedData]);

  return [data];
};

// const {data} = useSWR(
//   'https://api.covid19india.org/v2/data.min.json',
//   fetcher,
//   {
//     initialData: INITIAL_DATA,
//     suspense: true,
//     revalidateOnFocus: false,
//     refreshInterval: 5 * 60 * 1000,
//     compare: (dataA, dataB) => {
//       return dataA['TT'].last_updated - dataB['TT'].last_updated;
//     },
//   }
// );
