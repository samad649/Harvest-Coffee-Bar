import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Chip from "@mui/material/Chip";



const ItemDropdown = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [itemName, setItemName] = useState(null);
  const [itemPrice, setItemPrice] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [selectedItemIngredients, setSelectedItemIngredients] = useState([]);

  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('https://project-3-906-03.onrender.com/items');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('https://project-3-906-03.onrender.com/ingredients');
        setIngredients(response.data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };

    fetchIngredients();
  }, []);

  useEffect(() => {
    const fetchSelectedItemDetails = async () => {
      if (selectedItem) {
        try {
          // Fetch the selected item details
          const response = await axios.get(`https://project-3-906-03.onrender.com/items/${selectedItem}`);
          const { itemname, itemprice, isavailable } = response.data.item;
  
          // Set the name, price, and availability based on the selected item
          setItemName(itemname);
          setItemPrice(itemprice);
          setIsAvailable(isavailable);
  
          // Fetch the selected item's ingredients
          const recipesResponse = await axios.get(`https://project-3-906-03.onrender.com/recipes/${selectedItem}`);
          const selectedItemIngredients = recipesResponse.data.map((recipe) => recipe.ingredientid);
          setSelectedItemIngredients(selectedItemIngredients);
        } catch (error) {
          console.error('Error fetching selected item details:', error);
        }
      }
    };
  
    fetchSelectedItemDetails();
  }, [selectedItem]);

  const handleItemChange = (event) => {
    const selectedItem = event.target.value;
    setSelectedItem(selectedItem);
  };

  const handleAvailabilityChange = () => {
    setIsAvailable((prevIsAvailable) => !prevIsAvailable);
  };

  const handleIngredientChange = (ingredientId) => {
    ingredientId = parseInt(ingredientId);
    const updatedSelectedIngredients = selectedItemIngredients.includes(ingredientId)
      ? selectedItemIngredients.filter((id) => id !== ingredientId)
      : [...selectedItemIngredients, ingredientId];
  
    setSelectedItemIngredients(updatedSelectedIngredients);
  };  

  const handleModifyClick = async () => {
    try {
      if (selectedItem) {
        // Fetch the selected item details
        const originalItem = await axios.get(`https://project-3-906-03.onrender.com/items/${selectedItem}`);
        const { itemname: originalName, isavailable: originalAvailability, itemprice: originalPrice } = originalItem.data.item;
  
        const originalRecipesResponse = await axios.get(`https://project-3-906-03.onrender.com/recipes/${selectedItem}`);
        const originalItemIngredients = originalRecipesResponse.data.map((recipe) => recipe.ingredientid);
  
        // Check if any modification is needed
        if (
          (originalAvailability !== isAvailable ||
          originalName !== itemName) &&
          originalPrice === itemPrice
        ) {
          const modItem = {
            itemname: itemName,
            isavailable: isAvailable,
            itemprice: originalPrice,
          };
  
          await axios.post(`https://project-3-906-03.onrender.com/items/${selectedItem}/modify`, modItem);
          console.log(modItem);

        } else if (
          originalPrice !== itemPrice || 
          originalItemIngredients !== selectedItemIngredients
        ) {
          const oldItem = {
            itemname: originalName,
            isavailable: false,
            itemprice: originalPrice,
          };
          await axios.post(`https://project-3-906-03.onrender.com/items/${selectedItem}/modify`, oldItem);

          const newItem = {
            itemname: itemName,
            isavailable: isAvailable,
            itemprice: itemPrice,
            ingredients: selectedItemIngredients
          }
          await axios.post('https://project-3-906-03.onrender.com/itemAdd', newItem)


        }
  
          // Fetch and update the list of items
          const response = await axios.get('https://project-3-906-03.onrender.com/items');
          setItems(response.data);
      }
    } catch (error) {
      console.error('Error modifying item:', error);
    }
  };
  
  
  return (
    <>
      <div className="modify-item-container">
        <div className="modify-item-left-column">
              <Box mt={2} width="100%">
                <FormControl fullWidth variant="filled">
                  <InputLabel id="itemDropdownLabel"></InputLabel>
                  <Select
                    labelId="itemDropdownLabel"
                    id="itemDropdown"
                    value={selectedItem || ''}
                    onChange={handleItemChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select an item</MenuItem>
                    {items.map((item) => (
                      <MenuItem key={item.itemid} value={item.itemid}>
                        {item.itemname}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

                <TextField
                  id="itemName"
                  label="Name"
                  variant="filled"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />

                <TextField
                  id="itemPrice"
                  label="Price"
                  variant="filled"
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />

              <Box mt={2} width="100%">
                <Button
                  variant="contained"
                  onClick={handleAvailabilityChange}
                  className={`availability-button ${isAvailable ? 'available' : 'not-available'}`}
                  fullWidth
                >
                  {isAvailable ? 'Available' : 'Not Available'}
                </Button>
              </Box>

              <Box mt={2} width="100%">
                <Button size="large" variant="contained" onClick={handleModifyClick} className="modify-button" fullWidth>
                  Modify
                </Button>
              </Box>
        </div>

        <div className="modify-item-right-column">
          <Grid container spacing={2}>
            <Grid item sm={12}>
              <Paper className="modify-item-paper-container">
                <div className="modify-item-chips-container">
                  {ingredients.map((ingredient) => (
                    <Chip
                      key={ingredient.ingredientid}
                      label={ingredient.ingredientname}
                      clickable
                      color={selectedItemIngredients.includes(ingredient.ingredientid) ? 'primary' : 'default'}
                      onClick={() => handleIngredientChange(ingredient.ingredientid)}
                      className="modify-item-chip"
                    />
                  ))}
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>
    </>
  );
};

export default ItemDropdown;