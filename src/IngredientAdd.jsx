import React from "react";
import { Button, Container, Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import axios from "axios";

function IngredientAdd() {
  return (
    <Container maxWidth="sm">
      <Grid container spacing={2}>
        <Grid item xs={12}>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="Ingredient-Name"
            label="Ingredient Name"
            variant="filled"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="Current-Stock"
            label="Current-Stock"
            variant="filled"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="Restock-Amount"
            label="Restock-Amount"
            variant="filled"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            className="enter-button"
            onClick={async () => {
              const info = {
                ingredientname: document.getElementById("Ingredient-Name").value,
                ingredientstock: document.getElementById("Current-Stock").value,
                ingredientrestockamount: document.getElementById("Restock-Amount").value,
              };
              try {
                await axios.post(
                  "https://project-3-906-03.onrender.com/ingredientAdd",
                  info
                );
                alert("Item added successfully!");
              } catch (err) {
                console.error("Error adding item:", err);
                alert("Failed to add the item.");
              }
            }}
          >
            Enter
          </Button>
        </Grid>
        <Grid item xs={12}>
        </Grid>
      </Grid>
    </Container>
  );
}

export default IngredientAdd;
