import React, { useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import DataTable from './DataTable';
import ReactDOMServer from 'react-dom/server';

function RestockReport() {


  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('https://project-3-906-03.onrender.com/restockReport');
      console.log(response.data);

      const newTab = window.open('', '_blank');
      newTab.document.write(`
        <html>
          <head>
            <title>Restock Report</title>
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
            <h1>Restock Report</h1>
      `);

      const dataTableComponent = (
        <DataTable headers={['Ingredient ID', 'Ingredient Name', 'Ingredient Stock', 'Ingredient Restock Threshold']} data={response.data} attributes={['ingredientid','ingredientname','ingredientstock','ingredientrestockamount']}/>
      );

      newTab.document.write('<div id="app"></div>');
      newTab.document.getElementById('app').innerHTML = ReactDOMServer.renderToString(dataTableComponent);

      newTab.document.write(`
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error generating restock report:', error);
    }
  };

  return (
    <>
      <hr />
      <Button onClick={handleGenerateReport}>Generate Restock Report</Button>
      <br />
    </>
  );
}

export default RestockReport;

