import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
/**
 * ExcessData component displays a list of items.
 *
 * @component
 * @param {Array} props.data - An array of the excess ingredients.
 * @returns {JSX.Element} - The rendered ExcessData component.
 */
const ExcessData = ({ data }) => {
  console.log(data);
  /**
   * Renders the ExcessData component.
   *
   * @returns {JSX.Element} - The rendered component.
   */
  return (
    <div>
      <List style={{ listStyle: 'none' }}>
        {data.map((item, index) => (
          <ListItem key={index}>
            <ListItemText>
              {item}
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default ExcessData;

