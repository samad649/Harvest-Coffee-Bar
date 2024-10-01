import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';

/**
 * DataTable component displays a table with headers and data.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array} props.headers - An array of header titles.
 * @param {Array} props.data - An array of data rows to be displayed.
 * @param {Array} props.attributes - An array of attributes to be displayed from each data row.
 * @returns {JSX.Element} - The rendered DataTable component.
 */
const DataTable = ({ headers, data, attributes }) => {
  /**
   * Calculates the width of each column based on the number of headers.
   *
   * @type {number}
   */
  const width = 100 / headers.length;

  /**
   * Renders the DataTable component.
   *
   * @returns {JSX.Element} - The rendered component.
   */
  return (
    <div>
      <TableContainer component={Paper} style={{ fontFamily: 'Roboto, sans-serif', border: '1px solid #ddd' }}>
        <Table style={{ minWidth: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <Typography variant="h4" gutterBottom key={index}>
                  <TableCell style={{ fontWeight: 'normal', borderBottom: '1px solid #ddd', verticalAlign: 'middle', textAlign: 'center', width: `${width}%` }}>
                    {header}
                  </TableCell>
                </Typography>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} style={{ borderBottom: '1px solid #ddd' }}>
                {attributes.map((attribute, columnIndex) => (
                  <TableCell key={columnIndex} style={{ verticalAlign: 'middle', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                    {row[attribute]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

// Prop types for DataTable component
DataTable.propTypes = {
  /**
   * An array of header titles.
   */
  headers: PropTypes.array.isRequired,
  /**
   * An array of data rows to be displayed.
   */
  data: PropTypes.array.isRequired,
  /**
   * An array of attributes to be displayed from each data row.
   */
  attributes: PropTypes.array.isRequired,
};

export default DataTable;

