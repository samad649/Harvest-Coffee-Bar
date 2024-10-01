import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CheckLogin from './CheckLogin';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrderItems, setSelectedOrderItems] = useState({});
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [allItems, setAllItems] = useState([]);
    const [selectedItemsToAdd, setSelectedItemsToAdd] = useState({});
    const [showAddItem, setShowAddItem] = useState({});

    useEffect(() => {
        fetchAllItems();
    }, []);

    const fetchOrdersInRange = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://project-3-906-03.onrender.com/orders/range`, {
                params: { start: startDate, end: endDate }
            });
            setOrders(response.data);
            setSelectedOrderItems({});
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
        setLoading(false);
    };

    const fetchItemsForOrder = async (orderid) => {
        if (selectedOrderItems[orderid]) {
            setSelectedOrderItems({ ...selectedOrderItems, [orderid]: null });
        } else {
            try {
                const response = await axios.get(`https://project-3-906-03.onrender.com/orders/${orderid}/items`);
                setSelectedOrderItems({ ...selectedOrderItems, [orderid]: response.data });
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        }
    };

    const updateOrderStatus = async (orderid, newStatus) => {
        try {
            await axios.put(`https://project-3-906-03.onrender.com/orders/${orderid}/status`, { status: newStatus });
            const updatedOrders = orders.map(order => 
                order.orderid === orderid ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const deleteOrder = async (orderid) => {
        try {
            await axios.delete(`https://project-3-906-03.onrender.com/orders/${orderid}`);
            setOrders(orders.filter(order => order.orderid !== orderid));
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const fetchAllItems = async () => {
        try {
            const response = await axios.get('https://project-3-906-03.onrender.com/available-items');
            setAllItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleItemCheckboxChange = (orderid, itemid, isChecked) => {
        setSelectedItemsToAdd(prev => ({
            ...prev,
            [orderid]: {
                ...prev[orderid],
                [itemid]: isChecked
            }
        }));
    };
    
    const addItemsToOrder = async (orderid) => {
        const itemsToAdd = Object.entries(selectedItemsToAdd[orderid] || {})
                                .filter(([itemid, isChecked]) => isChecked)
                                .map(([itemid]) => itemid);
    
        try {
            await axios.post(`https://project-3-906-03.onrender.com/orders/${orderid}/add-items`, { items: itemsToAdd });
            
            alert('Items added to order successfully');
            setSelectedItemsToAdd(prev => ({ ...prev, [orderid]: {} }));
            setShowAddItem({ ...showAddItem, [orderid]: false });
        } catch (error) {
            console.error('Error adding items to order:', error);
            alert('Failed to add items to order');
        }
    };
    
    const renderOrderItems = (orderid) => {
        const items = selectedOrderItems[orderid];
        if (!items) return null;

        const deleteItemFromOrder = async (itemid) => {
            try {
                await axios.delete(`https://project-3-906-03.onrender.com/orders/${orderid}/items/${itemid}`);
                const updatedItems = items.filter(item => item.itemid !== itemid);
                setSelectedOrderItems({ ...selectedOrderItems, [orderid]: updatedItems });
            } catch (error) {
                console.error('Error deleting item from order:', error);
            }
        };

        return (
            <div>
                <h4>Items in Order {orderid}</h4>
                <ul>
                    {items.map(item => (
                        <li key={item.itemid}>
                            {item.itemname} - ${item.itemprice}
                            <button onClick={() => deleteItemFromOrder(item.itemid)}>Delete Item</button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderAddItemCheckboxes = (orderid) => {
        if (!showAddItem[orderid]) return null;
    
        return (
            <div className="add-items-section">
                <h4>Add Items to Order {orderid}</h4>
                {allItems.map(item => (
                    <div key={item.itemid} className="add-item-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedItemsToAdd[orderid]?.[item.itemid] || false}
                            onChange={(e) => handleItemCheckboxChange(orderid, item.itemid, e.target.checked)}
                            id={`checkbox-${orderid}-${item.itemid}`}
                        />
                        <label htmlFor={`checkbox-${orderid}-${item.itemid}`}>{item.itemname} - ${item.itemprice}</label>
                    </div>
                ))}
                <button onClick={() => addItemsToOrder(orderid)}>Add Selected Items</button>
            </div>
        );
    };
    
    

    const renderOrders = () => {
        if (loading) return <p>Loading...</p>;
        return orders.map(order => (
            <div key={order.orderid}>
                <h3>Order {order.orderid}</h3>
                <p>Status: {order.status}</p>
                <select 
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.orderid, e.target.value)}
                >
                    <option value="PENDING">Pending</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="CANCELED">Canceled</option>
                </select>
                <p>Ordered on: {formatDateTime(order.timeordered)}</p>
                <button onClick={() => fetchItemsForOrder(order.orderid)}>Show Items</button>
                <button onClick={() => setShowAddItem({ ...showAddItem, [order.orderid]: !showAddItem[order.orderid] })}>
                Add Item
            </button>
                <button onClick={() => deleteOrder(order.orderid)}>Delete Order</button>
                {selectedOrderItems[order.orderid] && renderOrderItems(order.orderid)}
                {renderAddItemCheckboxes(order.orderid)}
                
            </div>
        ));
    };

    // formatDateTime function
    const formatDateTime = (dateTimeString) => {
        // Remove the 'T' and milliseconds part, and convert to the desired format
        return dateTimeString.replace('T', ' ').split('.')[0];
    };
    

    return (
        
        <div className="order-management-container">
            <CheckLogin 
                        checkManager={ false }
                        checkAdmin={ false }
                    />
            <h2>Order Management</h2>
            <div className="date-range-inputs">
            <label >Start Date:</label>
                <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <label >End Date:</label>
                <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button onClick={fetchOrdersInRange}>Get Orders</button>
            </div>
            <Link to="/ManagerOrder">
                <button>Create an Order</button>
            </Link>
            <div className="orders-container">
                {renderOrders()}
            </div>
        </div>
    );
};

export default OrderManagement;