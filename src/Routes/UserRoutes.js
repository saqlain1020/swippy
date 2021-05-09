import { Link } from "@material-ui/core";
import React from "react";
import BurgerMenu from "src/Pages/BurgerMenu/BurgerMenu";
import Profile from "src/Pages/Profile/Profile";
import AuthenticatedRoute from './AuthenticatedRoute';

const menuItems = [
    <Link to="/" >Home</Link>,
    <Link to="/dashboard" >Dashboard</Link>,
    <Link to="/dashboard/QR">Generate QR</Link>,
    <Link to="/signout" >Sign out</Link>,
]

const UserRoutes = () => {
  return (
    <>
      <BurgerMenu items={menuItems}>
          <AuthenticatedRoute path="/dashboard/profile" component={Profile}/>
      </BurgerMenu>
    </>
  );
};

export default UserRoutes;
