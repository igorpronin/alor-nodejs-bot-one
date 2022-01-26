import {IInstrument} from './models/instruments';

interface IOptionsByCancellationDate {
  all: IInstrument[],
  strikesList: number[],
  byStrikes: {[key: string]: IInstrument}
}

interface IInstrumentsDataByTickers {
  optionsFar: IInstrument[]
  optionsNear: IInstrument[]
  optionsByCancellationDate: {[key: string]: IOptionsByCancellationDate}
  futures: IInstrument[]
  futureDatesList: Set<string>
  optionsDatesList: Set<string>
}


interface IStore {
  fortsInstrumentsRaw: IInstrument[]
  symbolsList: string[],
  instrumentsDataByTickers: {[key: string]: IInstrumentsDataByTickers}
  accessToken: null | string
}

const store: IStore = {
  fortsInstrumentsRaw: [],
  symbolsList: [],
  instrumentsDataByTickers: {},
  accessToken: null
}

export default store;
