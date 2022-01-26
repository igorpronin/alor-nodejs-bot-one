import store from './store';

export const hasOptions = (ticker: string): boolean => {
  return !!store.instrumentsDataByTickers[ticker]?.optionsDatesList.size;
}
