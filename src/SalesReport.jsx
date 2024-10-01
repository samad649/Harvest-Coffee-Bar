import * as React from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DataTable from './DataTable';
import ReactDOMServer from 'react-dom/server';

function SalesReport() {
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
             <title>Sales Report</title>
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
             <h1>Sales Report</h1>
             <h3>${formattedDate1} - ${formattedDate2}</h3>
       `);
      const itemList = await axios.get('https://project-3-906-03.onrender.com/available-items');

      const resultArray = [];

      for (const item of itemList.data) {
        const price = item.itemprice;
        const url = `https://project-3-906-03.onrender.com/salesReport?itemid=${item.itemid}&startTime=${formattedDate1}&endTime=${formattedDate2}`;
        
        try {
          const info = await axios.get(url);
          const total = info.data.itemCount * price;
          resultArray.push({
            itemname: item.itemname,
            total: "$" + total
          });
        } catch (error) {
          console.error('Error fetching sales report:', error);
        }
      }
            console.log(resultArray);
            const dataTableComponent = (
              <DataTable headers={['Item Name', 'Total Amount']} data={resultArray} attributes={['itemname','total']}/>
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
      <Button onClick={handleGenerateReport}>Generate Sales Report</Button>
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

export default SalesReport;
