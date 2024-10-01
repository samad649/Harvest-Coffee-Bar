import * as React from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DataTable from './DataTable';
import ReactDOMServer from 'react-dom/server';

function OrderTrends() {
  const [value1, setValue1] = React.useState(dayjs('2023-11-20'));
  const [value2, setValue2] = React.useState(dayjs('2023-11-21'));

  const handleGenerateReport = async () => {
    const formattedDate1 = value1.format('YYYY-MM-DD');
    const formattedDate2 = value2.format('YYYY-MM-DD');

    try {
          const newTab = window.open('', '_blank');
          newTab.document.write(`
            <html>
              <head>
                <title>Order Trends Report</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                <style>
                  body {
                    text-align: center;
                    font-family: 'Roboto', sans-serif;
                    padding: 10px;
                  }
                </style>
              </head>
              <body>
                <h1>Order Trends Report</h1>
                <h3>${formattedDate1} - ${formattedDate2}</h3>
          `);

const list = await axios.get('https://project-3-906-03.onrender.com/available-items');
const itemList = list.data;

const itemPairsList = itemList.map(item => ({ id: item.itemid, name: item.itemname }));

const Trends = [];

for (let i = 0; i < itemPairsList.length; i++) {
  for (let j = i + 1; j < itemPairsList.length; j++) {    
      const appearances = await axios.get(`https://project-3-906-03.onrender.com/orderTrends?item1=${itemPairsList[i].id}&item2=${itemPairsList[j].id}&startTime=${formattedDate1}&endTime=${formattedDate2}`);

      const total = appearances.data;

      Trends.push({
        item1: itemPairsList[i].name ,
        item2: itemPairsList[j].name,
        total: total,
      });

  }
}

Trends.sort((a, b) => b.total - a.total);

console.log(Trends);


      const dataTableComponent = (
        <DataTable headers={['Item 1','Item 2','Total']} data={Trends} attributes={['item1','item2','total']}/>
      );

      newTab.document.write('<div id="app"></div>');
      newTab.document.getElementById('app').innerHTML = ReactDOMServer.renderToString(dataTableComponent);

      newTab.document.write(`
          </body>
        </html>
      `);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      <hr />
      <Button onClick={handleGenerateReport}>Generate Order Trends Report</Button>
      <br />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Start Date"
          value={value1}
          onChange={(newValue) => setValue1(newValue)}
        />
      </LocalizationProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="End Date"
          value={value2}
          onChange={(newValue) => setValue2(newValue)}
        />
      </LocalizationProvider>
    </>
  );
}

export default OrderTrends;