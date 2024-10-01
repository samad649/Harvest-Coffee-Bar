import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button } from '@mui/material';
import axios from 'axios';
import ExcessData from './ExcessData';
import ReactDOMServer from 'react-dom/server';

/**
 * ExcessReport component allows users to generate an excess report for ingredients.
 *
 * @component
 */
function ExcessReport() {
  /**
   * State hook to manage the selected date.
   *
   * @type {Object}
   */
  const [value, setValue] = React.useState(dayjs('2023-11-20'));

  /**
   * Handles the generation of the excess report.
   *
   * @async
   */
  const handleGenerateReport = async () => {
    /**
     * Formatted date string.
     *
     * @type {string}
     */
    const formattedDate = value.format('YYYY-MM-DD');
<<<<<<< HEAD

    /**
     * New browser tab for displaying the excess report.
     *
     * @type {Window}
     */
    const newTab = window.open('', '_blank');
    newTab.document.write(`
      <html>
        <head>
          <title>Excess Report</title>
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
          <h1>Excess Report</h1>
          <h2>list of ingredients that only sold less than 10% of their inventory</h2>
          <h3>${formattedDate} - Current</h3>
    `);

    /**
     * API response containing excess report data.
     *
     * @type {Object}
     */
    const response = await axios.get(`http://localhost:5001/excessReport/${formattedDate}`);

    /**
     * React component for displaying excess report data in a table.
     *
     * @type {JSX.Element}
     */
    const dataTableComponent = (
      <ExcessData data={response.data.excessIngredients} />
    );
=======
              const newTab = window.open('', '_blank');
              newTab.document.write(`
                <html>
                  <head>
                    <title>Excess Report</title>
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
                    <h1>Excess Report</h1>
                    <h2>list of ingredients that only sold less than 10% of their inventory</h2>
                    <h3>${formattedDate} - Current</h3>
              `);
    
    const response = await axios.get(`https://project-3-906-03.onrender.com/excessReport/${formattedDate}`);
                          
      const dataTableComponent = (
        <ExcessData  data={response.data.excessIngredients} />
      );

      newTab.document.write('<div id="app"></div>');
      newTab.document.getElementById('app').innerHTML = ReactDOMServer.renderToString(dataTableComponent);
>>>>>>> 11893a7f98e39759e2a3d73040575683c84af5be

    // Convert the React component to HTML and append it to the new tab
    newTab.document.write('<div id="app"></div>');
    newTab.document.getElementById('app').innerHTML = ReactDOMServer.renderToString(dataTableComponent);

    newTab.document.write(`
      </body>
    </html>
  `);
  };

  /**
   * Renders the ExcessReport component.
   *
   * @returns {JSX.Element} - The rendered component.
   */
  return (
    <>
      <hr />
      <Button onClick={handleGenerateReport}>Generate Excess Report</Button>
      <br />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Start Date"
          value={value}
          onChange={(newValue) => setValue(newValue)}
        />
      </LocalizationProvider>
    </>
  );
}

export default ExcessReport;

