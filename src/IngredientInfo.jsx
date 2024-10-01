// IngredientInfo.js

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import axios from "axios";
import React, { useState } from "react";
// import "./IngredientInfo.css";

function IngredientInfo({ ingredient }) {
  const [show, setshow] = useState(false);

  const handleEdit = async () => {
    const info = {
      ingredientname: ingredient.ingredientname,
      ingredientstock: document.getElementById("currentStock").value,
      ingredientrestockamount: document.getElementById("threshold").value,
    };

    try {
      const ingredientId = ingredient.ingredientid;
      await axios.post(
        `https://project-3-906-03.onrender.com/ingredients/${ingredientId}/modify`,
        info
      );
      alert("Ingredient modified successfully!");
    } catch (err) {
      console.error("Error modifying ingredient:", err);
      alert("Failed to modify the ingredient.");
    }
  };

  return (
    <div className="ingredient-modify-container">
      <h1>{ingredient.ingredientname}</h1>
      <div className="ingredient-modify-details">
        <Grid container spacing = {2}>
          <Grid item xl = {15}>
            <TextField
              className="ingredient-modify-shrunken-textField"
              label="Current Stock"
              variant="filled"
              value={ingredient.ingredientstock}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container spacing = {2}>
          <Grid item xl = {15}>
            <TextField
              className="ingredient-modify-shrunken-textField"
              label="Restock Threshold"
              variant="filled"
              value={ingredient.ingredientrestockamount}
              disabled
            />
          </Grid>
        </Grid>
      </div>
      <hr />
      <Button
        className="ingredient-modify-editButton"
        onClick={() => setshow(!show)}
        variant="filled"
      >
        Edit
      </Button>
      {show && (
        <div className="ingredient-modify-editForm">
          <Grid container spacing={2}>
            <Grid item xs={15}>
              <TextField
                className="ingredient-modify-textField"
                id="currentStock"
                label="Current Stock"
                variant="filled"
                defaultValue={ingredient.ingredientstock}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={15}>
              <TextField
                className="ingredient-modify-textField"
                id="threshold"
                label="Stock Threshold"
                variant="filled"
                defaultValue={ingredient.ingredientrestockamount}
              />
            </Grid>
          </Grid>
          <Button
            className="ingredient-modify-enterButton"
            onClick={handleEdit}
          >
            Enter
          </Button>
        </div>
      )}
    </div>
  );
}

export default IngredientInfo;