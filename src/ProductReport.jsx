import * as React from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DataTable from './DataTable';
import ReactDOMServer from 'react-dom/server';

function ProductReport() {
  const [value1, setValue1] = React.useState(dayjs('2022-11-20'));
  const [value2, setValue2] = React.useState(dayjs('2023-8-21'));

  const handleGenerateReport = async () => {
    const formattedDate1 = value1.format('YYYY-MM-DD');
    const formattedDate2 = value2.format('YYYY-MM-DD');

    try {
        const newTab = window.open('', '_blank');
        newTab.document.write(`
          <html>
            <head>
              <title>Product Report</title>
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
              <h1>Product Report</h1>
              <h3>${formattedDate1} - ${formattedDate2}</h3>
        `);

      const url = `https://project-3-906-03.onrender.com/productReport?startTime=${formattedDate1}&endTime=${formattedDate2}`;
      const response = await axios.get(url);

      const dataTableComponent = (
        <DataTable headers={['Ingredient Name', 'Ingredient ID', 'Usage Frequency']} data={response.data} attributes={['ingredientid','ingredientname','usage_frequency']} />
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
      <Button onClick={handleGenerateReport}>Generate Product Usage Chart</Button>
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

export default ProductReport;
