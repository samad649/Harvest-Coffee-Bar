import React, { useState, useEffect } from "react";
import axios from 'axios';
import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";

const AddItem = ({ onItemAdded }) => {
    const [ingredientList, setIngredientList] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    const handleChipClick = (ingredient) => {
        const isSelected = ingredientList.includes(ingredient.ingredientid);
        if (isSelected) {
            setIngredientList(ingredientList.filter(id => id !== ingredient.ingredientid));
        } else {
            setIngredientList([...ingredientList, ingredient.ingredientid]);
        }
    };

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

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const newItemData = {
                itemname: document.getElementById('itemName').value,
                itemprice: document.getElementById('price').value,
                isavailable: true,
                ingredients: ingredientList,
            };

            await axios.post('https://project-3-906-03.onrender.com/itemAdd', newItemData);

            document.getElementById('itemName').value = '';
            document.getElementById('price').value = '';
            setIngredientList([]);

            alert('Item added successfully!');
            onItemAdded();
        } catch (err) {
            console.error("Error adding item:", err);
            alert('Failed to add the item.');
        }
    };

    return (
        <div className="manager-add-container">
            <div className="manager-add-left-column">
                <TextField id="itemName" label="Item Name" variant="filled" fullWidth />
                <TextField id="price" label="Price" variant="filled" fullWidth />
                <Box mt={2}>
                    <Button size="large" variant="contained" onClick={handleAddItem} className="add-button" fullWidth>
                        Add Item
                    </Button>
                </Box>
            </div>
            <div className="manager-add-right-column">
                <Paper className="manager-add-paper-container">
                    {ingredients.map((ingredient, index) => (
                        <Chip
                            key={ingredient.ingredientid}
                            label={ingredient.ingredientname}
                            clickable
                            color={ingredientList.includes(ingredient.ingredientid) ? 'primary' : 'default'}
                            onClick={() => handleChipClick(ingredient)}
                            className="manager-add-chip"
                        />
                    ))}
                </Paper>
            </div>
        </div>
    );
};

export default AddItem;
