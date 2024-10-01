import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import './CustomerOrder.css';

function CustomerOrder() {
    const [items, setItems] = useState([]);
    const [order, setOrder] = useState([]);
    const [orderDateTime, setOrderDateTime] = useState(new Date().toISOString().slice(0, 16));

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

    const addItemToOrder = (item) => {
        setOrder((currentOrder) => {
            const newOrder = { ...currentOrder };
            if (newOrder[item.itemid]) {
                newOrder[item.itemid].count += 1;
            } else {
                newOrder[item.itemid] = { ...item, count: 1 };
            }
            return newOrder;
        });
    };
    

    const removeItemFromOrder = (itemid) => {
        setOrder((currentOrder) => {
            const newOrder = { ...currentOrder };
            if (newOrder[itemid].count === 1) {
                delete newOrder[itemid];
            } else {
                newOrder[itemid].count -= 1;
            }
            return newOrder;
        });
    };

    const removeAllOrders = () => {
        setOrder({}); 
    };

    const calculateTotal = () => {
        return Object.values(order).reduce((total, item) => total + (item.count * item.itemprice), 0);
    };

    const splitItemsIntoRows = (items, itemsPerRow) => {
        const rows = [];
        for (let i = 0; i < items.length; i += itemsPerRow) {
            rows.push(items.slice(i, i + itemsPerRow));
        }
        return rows;
    };

    const checkoutOrder = async () => {
        if (window.confirm("Are you sure you want to place the order?")) {
            const customerName = prompt("Please enter your name for the order (optional):") || "";
    
            // Include count for each item in orderItems
            const orderItems = Object.values(order).map(item => ({
                itemid: item.itemid,
                count: item.count
            }));
    
            try {
                const response = await axios.post('https://project-3-906-03.onrender.com/checkout', {
                    orderItems, 
                    customerName, 
                    orderDateTime 
                });
                if (response.status === 200) {
                    alert('Order placed successfully!');
                    setOrder([]); 
                } else {
                    alert(`There was a problem placing your order: ${response.status}`);
                }
            } catch (error) {
                console.error('Error placing order:', error);
                alert('Error placing order. Please try again later.');
            }
        } else {
            alert('Checkout cancelled.');
        }
    };
    
    
    return (
        <div className="App">
            <div className="cashier-container">
                <div className="items-container2">
                    {splitItemsIntoRows(items, 3).map((row, rowIndex) => (
                        <div key={rowIndex} className="columns">
                            {row.map((item) => (
                                <button
                                    className="column"
                                    key={item.itemid}
                                    onClick={() => addItemToOrder(item)}
                                >
                                    <div className="customer-item-name">{item.itemname}</div>
                                    <div >--------------</div>
                                    <div className="customer-item-price">Price: ${item.itemprice}</div>
                                    <div >--------------</div>
                                    <div className="customer-item-ingredients">
                                        Ingredients: {item.ingredients.join(', ')}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
    

                <div className="order-container">
                    <h2>Order</h2>
                    <ul>
                        {Object.values(order).map((item) => (
                            <li key={item.itemid}>
                                <div className="item-details">
                                    <span>{item.itemname} x {item.count}</span>
                                </div>
                                <div className="item-price">
                                    <span>${(item.itemprice * item.count).toFixed(2)}</span>
                                    <button 
                                        onClick={() => removeItemFromOrder(item.itemid)}
                                        className="remove-item-button"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="total-cost">
                        <strong>Total Cost:</strong> ${calculateTotal().toFixed(2)}
                    </div>

                    <div className="datetime-picker">
                        <label htmlFor="order-datetime">Choose Order Date and Time:</label>
                        <input
                            type="datetime-local"
                            id="order-datetime"
                            value={orderDateTime}
                            onChange={(e) => setOrderDateTime(e.target.value)}
                        />
                    </div>

                    <button onClick={checkoutOrder} className="checkout-button">
                        Checkout
                    </button>
                    <button onClick={removeAllOrders} className="remove-all-button">
                        Remove All
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CustomerOrder;
