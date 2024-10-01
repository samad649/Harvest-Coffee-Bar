const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors()); 
app.use(express.json());

const pool = new Pool({
    //user: process.env.POSTGRES_USER,
    //host: process.env.POSTGRES_HOST,
    //database: process.env.POSTGRES_DB,
    //password: process.env.POSTGRESS_PASSWORD,
    //port: parseInt(process.env.PORT) || 8080, 
    user: 'csce315_906_03user',
    host: 'csce-315-db.engr.tamu.edu',
    database: 'csce315_906_03db',
    password: 'biU0cQD3',
    port: 5432, 
  });

app.get('/items', async (req, res) => {
    try {
        const results = await pool.query("SELECT * FROM items");
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/ingredients', async (req, res) => {
  try {
      const results = await pool.query("SELECT * FROM ingredients");
      res.json(results.rows);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
app.post('/ingredientAdd', async (req, res) => {
    const { ingredientname, ingredientstock, ingredientrestockamount } = req.body;

    try {
        // Fetch the maximum ingredientid from the database
        const maxIngredientIdResult = await pool.query("SELECT MAX(ingredientid) as maxid FROM ingredients");
        const maxIngredientId = maxIngredientIdResult.rows[0].maxid;

        // Calculate the new ingredientid (assuming maxIngredientId is not null)
        const ingredientid = maxIngredientId + 1;

        // Insert the new ingredient into the database
        const values = [ingredientid, ingredientname, ingredientstock, ingredientrestockamount];
        const queryText = 'INSERT INTO ingredients (ingredientid, ingredientname, ingredientstock, ingredientrestockamount) VALUES ($1, $2, $3, $4) RETURNING *';
        const results = await pool.query(queryText, values);

        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/ingredients/:id/modify', async (req, res) => {
    const ingredientid = req.params.id;
    const { ingredientname, ingredientstock,ingredientrestockamount} = req.body;
  
    try {
        const updateIngredientQuery = `
          UPDATE ingredients 
          SET ingredientname = $1, ingredientstock = $2, ingredientrestockamount = $3
          WHERE ingredientid = $4
          RETURNING *
        `;
        const values = [ingredientname, ingredientstock, ingredientrestockamount, ingredientid];
    
        const updatedIngredient = await pool.query(updateIngredientQuery, values);
    
        res.json(updatedIngredient.rows[0]);
      } catch (error) {
        console.error('Error modifying ingredients:', error);
        res.status(500).json({ error: 'Failed to modify the ingredient' });
      }
  });

  
app.post('/itemAdd', async (req, res) => {
    try {
        const { itemname, itemprice, isavailable, ingredients } = req.body;

        console.log(itemname);
        if (!itemname || typeof itemprice === 'undefined' || typeof isavailable === 'undefined' || !ingredients || ingredients.length === 0) {
            return res.status(400).json({ error: "Required fields: itemname, itemprice, isavailable, ingredients" });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query('SELECT MAX(itemid) as maxid FROM items');
            const maxId = result.rows[0].maxid;
            const newItemId = (maxId || 0) + 1;

            const queryText = 'INSERT INTO items (itemid, itemname, itemprice, isavailable) VALUES ($1, $2, $3, $4) RETURNING *';
            const values = [newItemId, itemname, itemprice, isavailable];

            const insertResult = await client.query(queryText, values);

            const insertRecipeQuery = 'INSERT INTO recipes (itemid, ingredientid) VALUES ($1, $2)';
            for (const ingredientId of ingredients) {
                await client.query(insertRecipeQuery, [newItemId, ingredientId]);
            }

            await client.query('COMMIT');

            res.json(insertResult.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/item/:itemid/price', async (req, res) => {
    const itemid = req.params.itemid;
    try {
        const query = 'SELECT itemprice FROM items WHERE itemid = $1';
        const result = await pool.query(query, [itemid]);
        const price = result.rows[0].itemprice;
        res.json({ price });
    } catch (error) {
        console.error('Error fetching item price:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/checkout', async (req, res) => {
    const { customerName, orderItems, orderDateTime } = req.body;
    const employeeId = 1; // Dummy employee ID

    console.log("Received order details:", { customerName, orderItems, orderDateTime });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const orderInsertText = `
            INSERT INTO orders (orderid, employeeid, customername, timeordered)
            VALUES ((SELECT COALESCE(MAX(orderid), 0) + 1 FROM orders), $1, $2, $3)
            RETURNING orderid; 
        `;
        const orderValues = [employeeId, customerName || null, orderDateTime];
        const orderResult = await client.query(orderInsertText, orderValues);
        const newOrderId = orderResult.rows[0].orderid;

        console.log("New order created with ID:", newOrderId);

        for (const item of orderItems) {
            console.log(`Processing item: ${item.itemid}, Quantity: ${item.count}`);

            for (let i = 0; i < item.count; i++) {
                const itemInsertText = `
                    INSERT INTO ordersitems (orderid, itemid)
                    VALUES ($1, $2);
                `;
                const itemValues = [newOrderId, item.itemid];
                await client.query(itemInsertText, itemValues);
            }

            console.log(`Inserted item ${item.itemid} into ordersitems`);

            const recipeQueryText = 'SELECT ingredientid FROM recipes WHERE itemid = $1;';
            const recipeValues = [item.itemid];
            const recipeResult = await client.query(recipeQueryText, recipeValues);

            for (const ingredient of recipeResult.rows) {
                console.log(`Updating stock for ingredient: ${ingredient.ingredientid}, Decrease by: ${item.count}`);

                const updateStockText = `
                    UPDATE ingredients
                    SET ingredientstock = ingredientstock - $2
                    WHERE ingredientid = $1 AND ingredientstock >= $2;
                `;
                const updateStockValues = [ingredient.ingredientid, item.count];
                await client.query(updateStockText, updateStockValues);
            }

            console.log(`Stock updated for item ${item.itemid}`);
        }

        await client.query('COMMIT');
        console.log("Order processed successfully.");
        res.json({ orderId: newOrderId, message: 'Order placed successfully' });
    } catch (error) {
        console.error('Error during checkout process:', error);
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
});




app.get('/available-items', async (req, res) => {
    try {
        // Query to select only the items where isavailable is true
        const results = await pool.query("SELECT * FROM items WHERE isavailable = true");
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/items/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
      const itemQuery = 'SELECT * FROM items WHERE itemid = $1';
      const itemResult = await pool.query(itemQuery, [itemId]);
      const item = itemResult.rows[0];

      const ingredientsQuery = 'SELECT i.ingredientid, i.ingredientname, r.itemid FROM ingredients i JOIN recipes r ON i.ingredientid = r.ingredientid WHERE r.itemid = $1';
      const ingredientsResult = await pool.query(ingredientsQuery, [itemId]);
      const ingredients = ingredientsResult.rows;

      res.json({ item, ingredients });
  } catch (error) {
      console.error('Error fetching item details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/recipes/:itemid', async (req, res) => {
    const itemId = req.params.itemid;
    try {
      const query = 'SELECT * FROM recipes WHERE itemid = $1';
      const result = await pool.query(query, [itemId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  app.post('/items/:id/modify', async (req, res) => {
    const itemId = req.params.id;
    const { itemname, itemprice, isavailable } = req.body;
  
    try {
      const updateItemQuery = `
        UPDATE items 
        SET itemname = $1, itemprice = $2, isavailable = $3
        WHERE itemid = $4
        RETURNING *
      `;
      const values = [itemname, itemprice, isavailable, itemId];
  
      const updatedItem = await pool.query(updateItemQuery, values);
  
      res.json(updatedItem.rows[0]);
    } catch (error) {
      console.error('Error modifying item:', error);
      res.status(500).json({ error: 'Failed to modify the item' });
    }
  });
app.get('/restockReport', async (req,res) => {
    try {
        const stockQuery = `SELECT *
        FROM ingredients
        WHERE ingredientstock < ingredientrestockamount;`;

        const stockAlert = await pool.query(stockQuery);
        const stockList = stockAlert.rows;
        res.json(stockList);

    } catch (error) {
        console.log("error");
    }
});

app.get('/productReport', async (req,res) => {
        const{startTime, endTime} = req.query;
        console.log(startTime);
        console.log(endTime);
    try {
         const sql = `WITH time_filtered_orders AS 
         ( SELECT o.orderid FROM orders o JOIN ordersitems oi ON o.orderid = oi.orderid
             WHERE o.timeordered BETWEEN '${startTime}'::date AND '${endTime}'::date ), 
             ingredients_used AS ( SELECT r.ingredientid FROM time_filtered_orders o JOIN ordersitems oi 
            ON o.orderid = oi.orderid JOIN recipes r ON oi.itemid = r.itemid ) 
            SELECT i.ingredientid, i.ingredientname, COUNT(*) as usage_frequency FROM ingredients_used iu 
            JOIN ingredients i ON iu.ingredientid = i.ingredientid GROUP BY i.ingredientid, i.ingredientname 
            ORDER BY usage_frequency DESC, i.ingredientid;`;

        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Server error');
    }
});


  // Fetch all orders with items
app.get('/orders', async (req, res) => {
    try {
        const ordersData = await pool.query(
            'SELECT o.orderid, o.status, i.itemid, i.itemname, i.itemprice ' +
            'FROM orders o ' +
            'JOIN ordersitems oi ON o.orderid = oi.orderid ' +
            'JOIN items i ON oi.itemid = i.itemid;'
        );
        res.json(ordersData.rows);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Update an order's status
app.put('/orders/:orderid', async (req, res) => {
    const { orderid } = req.params;
    const { status } = req.body;

    try {
        await pool.query('UPDATE orders SET status = $1 WHERE orderid = $2', [status, orderid]);
        res.send('Order updated successfully');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Create a new order
app.post('/orders', async (req, res) => {
    const { employeeid, customername, timeordered, status } = req.body;
    try {
        const newOrder = await pool.query(
            'INSERT INTO orders (employeeid, customername, timeordered, status) VALUES ($1, $2, $3, $4) RETURNING *;',
            [employeeid, customername, timeordered, status]
        );
        res.json(newOrder.rows[0]);
    } catch (err) {
        res.status(500).send('Server error');
    }
});



app.get('/orders/date/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const ordersData = await pool.query(
            'SELECT orderid, employeeid, customername, timeordered, status ' +
            'FROM orders ' +
            'WHERE DATE(timeordered) = DATE($1);', 
            [date]
        );
        res.json(ordersData.rows);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.get('/orders/:orderid/items', async (req, res) => {
    const { orderid } = req.params;

    try {
        const itemsData = await pool.query(
            'SELECT i.itemid, i.itemname, i.itemprice ' +
            'FROM ordersitems oi ' +
            'JOIN items i ON oi.itemid = i.itemid ' +
            'WHERE oi.orderid = $1;', 
            [orderid]
        );
        res.json(itemsData.rows);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.put('/orders/:orderid/status', async (req, res) => {
    const { orderid } = req.params;
    const { status } = req.body;

    try {
        await pool.query(
            'UPDATE orders SET status = $1 WHERE orderid = $2',
            [status, orderid]
        );
        res.send(`Order ${orderid} status updated to ${status}`);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Delete an order
app.delete('/orders/:orderid', async (req, res) => {
    const { orderid } = req.params;

    try {
        // Begin transaction
        await pool.query('BEGIN');

        // Delete related records in ordersitems
        await pool.query('DELETE FROM ordersitems WHERE orderid = $1', [orderid]);

        // Delete the order
        await pool.query('DELETE FROM orders WHERE orderid = $1', [orderid]);

        // Commit transaction
        await pool.query('COMMIT');

        res.send(`Order ${orderid} deleted successfully`);
    } catch (err) {
        //Rollback in case of error
        await pool.query('ROLLBACK');
        res.status(500).send('Server error');
    }
});

app.get('/orders/range', async (req, res) => {
    const { start, end } = req.query;

    try {
        const ordersData = await pool.query(
            'SELECT orderid, employeeid, customername, timeordered, status ' +
            'FROM orders ' +
            'WHERE timeordered >= $1 AND timeordered <= $2;', 
            [start, end]
        );
        res.json(ordersData.rows);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/checkoutManager', async (req, res) => {
    const { customerName, orderItems, orderDateTime } = req.body;
    const employeeId = 1; // Dummy employee ID

    console.log("Received order details:", { customerName, orderItems, orderDateTime });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const orderInsertText = `
            INSERT INTO orders (orderid, employeeid, customername, timeordered)
            VALUES ((SELECT COALESCE(MAX(orderid), 0) + 1 FROM orders), $1, $2, $3)
            RETURNING orderid; 
        `;
        const orderValues = [employeeId, customerName || null, orderDateTime];
        const orderResult = await client.query(orderInsertText, orderValues);
        const newOrderId = orderResult.rows[0].orderid;

        console.log("New order created with ID:", newOrderId);

        for (const item of orderItems) {
            console.log(`Processing item: ${item.itemid}, Quantity: ${item.count}`);

            for (let i = 0; i < item.count; i++) {
                const itemInsertText = `
                    INSERT INTO ordersitems (orderid, itemid)
                    VALUES ($1, $2);
                `;
                const itemValues = [newOrderId, item.itemid];
                await client.query(itemInsertText, itemValues);
            }

            console.log(`Inserted item ${item.itemid} into ordersitems`);

            const recipeQueryText = 'SELECT ingredientid FROM recipes WHERE itemid = $1;';
            const recipeValues = [item.itemid];
            const recipeResult = await client.query(recipeQueryText, recipeValues);

            for (const ingredient of recipeResult.rows) {
                console.log(`Updating stock for ingredient: ${ingredient.ingredientid}, Decrease by: ${item.count}`);

                const updateStockText = `
                    UPDATE ingredients
                    SET ingredientstock = ingredientstock - $2
                    WHERE ingredientid = $1 AND ingredientstock >= $2;
                `;
                const updateStockValues = [ingredient.ingredientid, item.count];
                await client.query(updateStockText, updateStockValues);
            }

            console.log(`Stock updated for item ${item.itemid}`);
        }

        await client.query('COMMIT');
        console.log("Order processed successfully.");
        res.json({ orderId: newOrderId, message: 'Order placed successfully' });
    } catch (error) {
        console.error('Error during checkout process:', error);
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
});


app.delete('/orders/:orderid/items/:itemid', async (req, res) => {
    const { orderid, itemid } = req.params;
    
    // SQL to delete the specific item from the order
    const deleteQuery = 'DELETE FROM ordersitems WHERE orderid = $1 AND itemid = $2';
    
    try {
        await pool.query(deleteQuery, [orderid, itemid]);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item from order:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/orders/:orderid/add-items', async (req, res) => {
    const { orderid } = req.params;
    const { items } = req.body; // Array of item IDs

    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Prepare a query for inserting items
        const insertQuery = 'INSERT INTO ordersitems (orderid, itemid) VALUES ($1, $2)';

        // Loop through each item and insert it into the database
        for (const itemid of items) {
            await pool.query(insertQuery, [orderid, itemid]);
        }

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(200).send('Items added to order successfully');
    } catch (error) {
        // Rollback the transaction in case of an error
        await pool.query('ROLLBACK');
        console.error('Error adding items to order:', error);
        res.status(500).send('Internal Server Error');
    }
});
  app.get('/isEmployee/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const employeeQuery = 'SELECT employeeid FROM employees WHERE email = $1 AND isEmployed = TRUE';
        const employeeResult = await pool.query(employeeQuery, [email]);
        var isEmployee = false;
        if(employeeResult.rowCount != 0){
            isEmployee = true;
        }

        const manQuery = 'SELECT employeeid FROM employees WHERE email = $1 and isManager = true';
        const manResult = await pool.query(manQuery, [email]);
        var isManager = false;
        if(manResult.rowCount != 0){
            isManager = true;
        }

        const adminQuery = 'SELECT employeeid FROM employees WHERE email = $1 and isAdmin = true';
        const adminResult = await pool.query(manQuery, [email]);
        var isAdmin = false;
        if(adminResult.rowCount != 0){
            isAdmin = true;
        }

        res.json({ 'isEmployee' : isEmployee,
                    'isManager' : isManager,
                    'isAdmin'   : isAdmin });
    } catch (error) {
        console.error('Error fetching item details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
    // EmployeeAdmin.jsx functionality
    app.get('/employees', async (req, res) => {
        try {
            const results = await pool.query('SELECT * FROM employees');
            res.json(results.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/employees/add', async (req, res) => {
        const { firstname, lastname, username, password, ismanager, isadmin, email, isemployed } = req.body;

        if (!firstname || !lastname || !username || !password || !email) {
            return res.status(400).json({ error: "Please ensure all fields have been entered" });
        }
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query("SELECT MAX(employeeid) as maxid FROM employees");
            const maxID = result.rows[0].maxid;
            const newEmployeeID = (maxID || 0) + 1;
    
            // Insert the new employee into the database
            const values = [newEmployeeID, firstname, lastname, username, password, ismanager, isadmin, email, isemployed];
            const queryText = 'INSERT INTO employees (employeeid, firstname, lastname, username, password, ismanager, isadmin, email, isemployed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';            
            const results = await client.query(queryText, values);

            await client.query('COMMIT');
    
            res.json(results.rows[0]);
        } catch (err) {
            console.error('Error adding employee:', err);
            res.status(500).json({ error: 'Failed to add the employee' });
        }
    });

    app.post('/employees/:id/modify', async (req, res) => {
        const employeeId = req.params.id;
        const { firstname, lastname, username, password, ismanager, isadmin, email, isemployed } = req.body;
    
        try {
            const updateEmployeeQuery = `
                UPDATE employees 
                SET firstname = $1, lastname = $2, username = $3, password = $4, ismanager = $5, isadmin = $6, email = $7, isemployed = $8
                WHERE employeeid = $9
                RETURNING *
            `;
            const values = [firstname, lastname, username, password, ismanager, isadmin, email, isemployed, employeeId];
        
    
            const updatedEmployee = await pool.query(updateEmployeeQuery, values);
    
            res.json(updatedEmployee.rows[0]);
        } catch (error) {
            console.error('Error modifying employee:', error);
            res.status(500).json({ error: 'Failed to modify the employee' });
        }
    });

app.get('/salesReport', async (req,res) => {
    try {
        const {itemid, startTime, endTime} = req.query;

        const selectQuery = `
        SELECT COUNT(*) AS item_count
        FROM ordersitems oi
        INNER JOIN orders o ON oi.orderID = o.orderID
        WHERE oi.itemID = ${itemid}
        AND o.timeordered::date BETWEEN '${startTime}'::date AND '${endTime}'::date;
      `;
      const result = await pool.query(selectQuery);
      if (result.rows.length > 0) {
        const itemCount = result.rows[0].item_count;
        res.json({ itemCount });
      } else {
        res.status(404).json({ error: 'No result found' });
      }
    } catch (error) {
        console.log("error");
    }
});
app.get('/orderTrends', async (req, res) => {
    const{item1,item2,startTime,endTime} = req.query;
    try {
        const sql = `WITH time_filtered_orders AS (
            SELECT orderid
            FROM orders
            WHERE timeordered BETWEEN '${startTime}'::date AND '${endTime}'::date
          )
          SELECT
            oi1.orderid,
            oi1.itemid AS itemid1,
            oi2.itemid AS itemid2,
            COUNT(*) AS appearances
          FROM
            time_filtered_orders o
            JOIN ordersitems oi1 ON o.orderid = oi1.orderid
            JOIN ordersitems oi2 ON o.orderid = oi2.orderid AND oi1.itemid < oi2.itemid
          WHERE
            oi1.itemid = ${item1}
            AND oi2.itemid = ${item2}
          GROUP BY
            oi1.orderid, oi1.itemid, oi2.itemid;`;
        const result = await pool.query(sql);
        const total = result.rowCount;
        res.json(total);

    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  app.get('/excessReport/:startTime', async (req, res) => {
    const startTime = req.params.startTime;

    try {
        const excessIngredients = await getExcessReport(startTime);
        res.json({ excessIngredients });
    } catch (error) {
        console.error('Error fetching excess report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
async function getExcessReport(startTime) {
    try {
        const orderQuery = `SELECT orderid FROM orders WHERE date_trunc('day', timeordered) >= '${startTime}'::date;`;

        const orderids = await pool.query(orderQuery);
        const orderidList = orderids.rows;
        const orderIds = orderidList.map(item => item.orderid);

        const minOrder = orderIds.reduce((min, current) => (current < min ? current : min), Infinity);

        const maxOrder = orderIds.reduce((max, current) => (current > max ? current : max), -Infinity);

        const ingredientList = await pool.query("SELECT * FROM ingredients");
        const excessIngredients = [];

        for (const row of ingredientList.rows) {
            const currIngr = row.ingredientname;
            const currStock = row.ingredientstock;
            const amountUsed = await getIngredientCount(currIngr,minOrder,maxOrder);

            if ((amountUsed / (amountUsed + currStock)) * 100 <= 10) {
                excessIngredients.push(currIngr);
            }
        }
        return excessIngredients;
    } catch (error) {
        console.error('Error in getExcessReport:', error);
        throw error;
    }
}
async function getIngredientCount(ingredientName, minOrder, maxOrder) {
    try{
       const itemIDList = await getItemIDsByIngredient(ingredientName);
       if(itemIDList !== undefined){
        if (itemIDList.length === 0) {
            return 0;
        }
       }
    const placeholders = itemIDList.map((_, index) => `$${index + 3}`).join(',');
    const selectStr = `
        SELECT COUNT(*) AS count
        FROM ordersitems
        WHERE orderid >= $1 AND orderid <= $2 AND itemID IN (${placeholders})
    `;
    const values = [minOrder, maxOrder, ...itemIDList];

    const selectResultSet = await pool.query(selectStr, values);

    const ingrUsedCount = selectResultSet.rows[0].count;

    return ingrUsedCount;
    }
    catch (error) {
        console.log('Error in getIngredientCount:', error);
        throw error;
    }
}
async function getItemIDsByIngredient(ingredientName) {
    try {
        const ingredientID = await pool.query(`SELECT ingredientid FROM ingredients WHERE ingredientname = '${ingredientName}';`);
        const ingredientid = ingredientID.rows[0].ingredientid
        // Execute the query to get itemIDs
        const recipeResultSet = await pool.query(`SELECT itemid FROM recipes WHERE ingredientid = '${ingredientid}';`); 

        // Extract itemidss from the result set
        const itemIDList = recipeResultSet.rows.map(row => row.itemid);
        return itemIDList;
    } catch (error) {
        console.log('Error in getItemIDsByIngredient:', error);
        throw error;
    }
}

app.get('/available-itemsCustomer', async (req, res) => {
    try {
        // Update query to join with ingredients or another table if needed
        const results = await pool.query(`
            SELECT items.*, array_agg(ingredients.ingredientname) as ingredients 
            FROM items 
            LEFT JOIN recipes ON items.itemid = recipes.itemid
            LEFT JOIN ingredients ON recipes.ingredientid = ingredients.ingredientid
            WHERE items.isavailable = true
            GROUP BY items.itemid
        `);
        res.json(results.rows.map(row => ({
            ...row,
            ingredients: row.ingredients.filter(ing => ing) // Filter out null values
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



//const PORT = parseInt(process.env.PORT) || 8080;
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
