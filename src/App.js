import React from 'react';
import { fromEvent, merge } from "rxjs";
import { scan, mergeMap, mapTo, startWith } from "rxjs/operators";
import './App.scss';
const seed = {
  type: "Sample",
  data: 0
};
export default function App() {
  const [latestData, setLatestData] = React.useState(seed);
  const [rawHistories, setRawHistories] = React.useState([]);
  const getInputValue = () => {
    const value = parseInt(document.querySelector("#input").value, 10);
    const formatedValue = isNaN(value) ? 0 : value;
    return formatedValue;
  };
  React.useEffect(() => {
    const sendButton = document.querySelector("#send");
    const resetButton = document.querySelector("#reset");
    const clickSendButton$ = fromEvent(sendButton, "click");
    const clickResetButton$ = fromEvent(resetButton, "click");
    const data$ = clickSendButton$.pipe(
      mergeMap(
        () =>
          new Promise((resolve) =>
            resolve({
              type: "Sample",
              data: getInputValue()
            })
          )
      )
    );
    const resetData$ = clickResetButton$.pipe(
      mapTo({
        type: "Sample",
        data: 0,
        reset: true,
      })
    );
    const sum$ = merge(data$ , resetData$).pipe(
      startWith(seed),
      scan(
        (acc, currentValue) => ({
          type: "Sample",
          data: currentValue.reset ? 0: acc.data + currentValue.data,
        })
      )
    );
    const rawHistory$ = data$.pipe(
      scan((acc, currentValue) => [...acc, currentValue], [])
    );
    sum$.subscribe((x) => {
      console.log(x);
      setLatestData(x);
    });
    rawHistory$.subscribe((x) => setRawHistories(x));
    return () => {
      if (sum$) {
        sum$.unsubscribe();
      }
      if (rawHistory$) {
        sum$.unsubscribe();
      }
    };
  }, []);
  return (
    <div className="App">
      <h4>RX JS Scan and Sum</h4>
      <br />
      <input type="number" id="input" placeholder="Fill a number"/>
      <br />
      <br />
      <button id="send">Click to send next data</button>
      <br/>
      <br/>
      <button id="reset">Reset</button>
      <br />
      <br />
      <div>
        <h5>Result:</h5>
        <p>Type: {latestData.type}</p>
        <p>Calculated Total Sum: {latestData.data}</p>
      </div>
      <br/>
      <br/>
      <div>
        <h5>Raw History :</h5>
        <p> {JSON.stringify(rawHistories)} </p>
      </div>
      <h4>♥ by Ayar Hlaine</h4>
    </div>
  );
}

