import React, { useEffect, useState } from "react";
import "./Header.css";
import { BiMenuAltRight } from "react-icons/bi";
import useHeaderColor from "../../hooks/useHeaderColor";
import OutsideClickHandler from "react-outside-click-handler";
import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";

const Header = () => {
  const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 800);
  const [menuOpened, setMenuOpened] = useState(false);
  const headerColor = useHeaderColor();
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0();

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSmall(window.innerWidth <= 800);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getMenuStyles = (menuOpened) => ({
    right: document.documentElement.clientWidth <= 800 && !menuOpened ? "-100%" : "0",
  });

  const handleMenuClose = () => {
    setMenuOpened(false);
  };

  return (
    <section className="h-wrapper" style={{ background: headerColor }}>
      <div className="flexCenter paddings innerWidh h-container">
        <Link to="/">
          <img src="./BlackLogo.jpg" alt="logo" width={100} style={{ borderRadius: "10%" }} />
        </Link>

        <OutsideClickHandler
          onOutsideClick={() => {
            setMenuOpened(false);
          }}
        >
          <div className="flexCenter h-menu" style={getMenuStyles(menuOpened)}>
            {isScreenSmall ? (
              !isAuthenticated ? (
                <button className="button button-green" onClick={loginWithRedirect}>
                  Login
                </button>
              ) : (
                <ProfileMenu user={user} logout={logout} />
              )
            ) : null}

            <NavLink to="/lotteries" onClick={handleMenuClose}>
              <button className="button button-blue">Lotteries</button>
            </NavLink>
            <Link to="/results" onClick={handleMenuClose}>
              <button className="button button-blue">Results</button>
            </Link>

            <Link to="/create" onClick={handleMenuClose}>
              <button className="button button-blue">Create Lottery</button>
            </Link>

            {!isScreenSmall && !isAuthenticated ? (
              <button className="button button-green" onClick={loginWithRedirect}>
                Login
              </button>
            ) : (
              !isScreenSmall && <ProfileMenu user={user} logout={logout} />
            )}
          </div>
        </OutsideClickHandler>
        <div className="menu-icon" onClick={() => setMenuOpened((prev) => !prev)}>
          <BiMenuAltRight size={30} />
        </div>
      </div>
    </section>
  );
};

export default Header;
