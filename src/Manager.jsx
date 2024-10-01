import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React, { useState } from "react";
import AddItem from "./AddItem";
import ExcessReport from "./ExcessReport";
import ModifyItem from './ModifyItem';
import OrderTrends from "./OrderTrends";
import ProductReport from "./ProductReport";
import RestockReport from "./RestockReport";
import SalesReport from "./SalesReport";

import CheckLogin from './CheckLogin';
import IngredientAdd from "./IngredientAdd";
import IngredientManager from "./IngredientManager";

const Manager = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <CheckLogin 
                checkManager={ true }
                checkAdmin={ false }
            />
      <Box>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Add New Item" />
          <Tab label="Modify Item Info" />
          <Tab label="Add New Ingredient" />
          <Tab label="Modify Ingredient Info" />
          <Tab label="Reports"/>
        </Tabs>
      </Box>
      
      {activeTab === 0 && <AddItem />}
      {activeTab === 1 && <ModifyItem />}
      {activeTab === 2 && <IngredientAdd />}
      {activeTab === 3 && <IngredientManager />}
      {activeTab === 4 && <>
        <OrderTrends/> 
        <ExcessReport/> 
        <RestockReport/>
        <SalesReport/>
        <ProductReport/>
        </>}
    </>
  );
};

export default Manager;
