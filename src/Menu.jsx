import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Menu() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await axios.get('https://project-3-906-03.onrender.com/available-itemsCustomer');
                setItems(response.data);
            } catch (err) {
                console.error("Error fetching items:", err);
            }
        }
        fetchItems();
    }, []);

    return (
        <div className="App">
            <div className="items-container2">
                <h2>Our Menu</h2>
                <div className="columns">
                    {items.map((item, index) => (
                        <div key={item.itemid} className="column">
                           <div className="customer-item-name">{item.itemname}</div>
                           <div >--------------</div>
                           <div className="customer-item-price">Price: ${item.itemprice}</div>
                           <div >--------------</div>
                           <div className="customer-item-ingredients">
                                        Ingredients: {item.ingredients.join(', ')}
                                    </div>
                        
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Menu;
