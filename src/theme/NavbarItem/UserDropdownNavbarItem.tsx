import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../authProviderBTP"; // Adjust path if necessary
import {Icon} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/person-placeholder.js";
import styles from "./UserDropdownNavbarItem.module.css"; // We'll create this for styling
import Link from "@docusaurus/Link";

export default function UserDropdownNavbarItem() {
  const { isLoggedIn, user, login, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (!isLoggedIn) {
    return (
      <button onClick={() => login()} className={`button ${styles.loginButton}`}>
        <Icon name="person-placeholder"></Icon>
      </button>
    );
  }

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Placeholder for avatar - to be replaced with actual image or icon
  const UserAvatar = () => (
    <div className={styles.userAvatarPlaceholder}>
      {user?.firstName?.charAt(0)}
      {user?.lastName?.charAt(0)}
    </div>
  );

  return (
    <div className={`navbar__item ${styles.userDropdown} ${isDropdownOpen ? styles.userDropdownOpenState : ""}`} ref={dropdownRef}>
      <button className={styles.userDropdown__button} onClick={toggleDropdown}>
        {/* Replace with an avatar icon/image if available */}
        <UserAvatar />
        <span className={styles.buttonUnderline}></span>
      </button>
      {isDropdownOpen && (
        <div className={`${styles.userDropdown__content} ${styles.userDropdown__contentOpen}`}>
          {user && (
            <div className={styles.userDropdown__header}>
              {/* Placeholder for actual avatar image */}
              <div className={styles.userAvatarLargePlaceholder}>
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </div>
              <div className={styles.userDropdown__userDetails}>
                <p className={styles.userName}>
                  {user.firstName} {user.lastName}
                </p>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
              {/* {user.ID && <p className={styles.userEmail}>UserId: {user.ID}</p>}
              {user.type && <p className={styles.userEmail}>Type: {user.type}</p>}
              {user.company && <p className={styles.userEmail}>Company: {user.company}</p>}
              {user.companyId && <p className={styles.userEmail}>CompanyId: {user.companyId}</p>} */}
            </div>
          )}

          <div className={styles.userDropdown__section}>
            <h3 className={styles.userDropdown__sectionTitle}>
              <Link to="https://account.sap.com/" target="_blank" rel="noopener noreferrer" className={styles.userDropdown__titleLink}>
                Manage my account
              </Link>
            </h3>
            <ul className={styles.userDropdown__linkList}>
              <li>
                <Link to="https://account.sap.com/manage/info" target="_blank" rel="noopener noreferrer" className={styles.userDropdown__link}>
                  Personal Information
                </Link>
              </li>
              <li>
                <Link to="https://account.sap.com/manage/security" target="_blank" rel="noopener noreferrer" className={styles.userDropdown__link}>
                  Security
                </Link>
              </li>
              <li>
                <Link to="https://account.sap.com/manage/privacy" target="_blank" rel="noopener noreferrer" className={styles.userDropdown__link}>
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.userDropdown__logoutSection}>
            <button onClick={() => logout()} className={`button button--primary ${styles.logoutButtonLarge}`}>
              Logout
            </button>
          </div>

          {/* <hr className={styles.userDropdown__separator} /> */}
        </div>
      )}
    </div>
  );
}
