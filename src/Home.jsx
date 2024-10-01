import React from "react";
import Menu from './Menu';
import { useUserContext } from './UserContext';

const Home = () => {
    const { state, dispatch } = useUserContext();


    return (
        <>
        <Menu />
        </>
    );
};

export default Home;