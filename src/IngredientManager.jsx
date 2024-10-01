import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import IngredientInfo from './IngredientInfo';
// import './IngredientManager.css';

function IngredientManager() {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');

  useEffect(() => {
    async function fetchIngredients() {
      try {
        const response = await axios.get('https://project-3-906-03.onrender.com/ingredients');
        setIngredients(response.data);
      } catch (err) {
        console.error("Error fetching ingredients:", err);
      }
    }
    fetchIngredients();
  }, []);

  return (
    <Grid container spacing={2} className="ingredient-manager-container">
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <FormControl fullWidth>
          <Select
            className="ingredient-select"
            labelId="ingredient-select-label"
            id="ingredient-select"
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
          >
            <MenuItem value="" disabled>
              Select Ingredient
            </MenuItem>
            {ingredients.map((ingredient) => (
              <MenuItem key={ingredient.id} value={ingredient.ingredientname}>
                {ingredient.ingredientname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {selectedIngredient && (
        <Grid item xs={12}>
          <IngredientInfo ingredient={ingredients.find(item => item.ingredientname === selectedIngredient)} />
        </Grid>
      )}
    </Grid>
  );
}

export default IngredientManager;
