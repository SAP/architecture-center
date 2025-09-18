import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@site/src/context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Icon, Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/person-placeholder.js';
import styles from './UserDropdownNavbarItem.module.css';
import Link from '@docusaurus/Link';

export default function UserDropdownNavbarItem() {
    const { user, loading, logout } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const backendUrl = siteConfig.customFields.backendUrl as string;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleLogin = (provider: 'btp' | 'github') => {
        window.location.href = `${backendUrl}/api/auth/${provider}`;
    };

    if (!user) {
        if (loading) {
            return <div className={styles.loadingPlaceholder}></div>;
        }

        return (
            <div className={`navbar__item ${styles.userDropdown}`} ref={dropdownRef}>
                <button onClick={toggleDropdown} className={styles.loginButton}>
                    <Icon name="person-placeholder"></Icon>
                    <span className={styles.loginButtonText}>Login</span>
                </button>
                {isDropdownOpen && (
                    <div
                        className={`${styles.userDropdown__content} ${styles.userDropdown__contentOpen} ${styles.loginOptions}`}
                    >
                        <Button
                            design="Emphasized"
                            onClick={() => handleLogin('btp')}
                            className={styles.loginOptionButton}
                        >
                            Login with BTP
                        </Button>
                        <Button
                            design="Transparent"
                            onClick={() => handleLogin('github')}
                            className={styles.loginOptionButton}
                        >
                            Login with GitHub
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    const UserAvatar = ({ isLarge = false }) => {
        if (user.provider === 'github' && user.avatar) {
            return (
                <img
                    src={user.avatar}
                    alt={user.username}
                    className={isLarge ? styles.userAvatarLarge : styles.userAvatar}
                />
            );
        }
        const initials =
            user.username
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || '';
        const placeholderClass = isLarge ? styles.userAvatarLargePlaceholder : styles.userAvatarPlaceholder;
        return <div className={placeholderClass}>{initials}</div>;
    };

    return (
        <div
            className={`navbar__item ${styles.userDropdown} ${isDropdownOpen ? styles.userDropdownOpenState : ''}`}
            ref={dropdownRef}
        >
            <button className={styles.userDropdown__button} onClick={toggleDropdown}>
                <UserAvatar />
                <span className={styles.buttonUnderline}></span>
            </button>
            {isDropdownOpen && (
                <div className={`${styles.userDropdown__content} ${styles.userDropdown__contentOpen}`}>
                    <div className={styles.userDropdown__header}>
                        <UserAvatar isLarge={true} />
                        <div className={styles.userDropdown__userDetails}>
                            <p className={styles.userName}>{user.username}</p>
                            {user.email && <p className={styles.userEmail}>{user.email}</p>}
                        </div>
                    </div>

                    {user.provider === 'btp' && (
                        <div className={styles.userDropdown__section}>
                            <h3 className={styles.userDropdown__sectionTitle}>
                                <Link
                                    to="https://account.sap.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.userDropdown__titleLink}
                                >
                                    Manage my SAP account
                                </Link>
                            </h3>
                            <ul className={styles.userDropdown__linkList}>
                                <li>
                                    <Link
                                        to="https://account.sap.com/manage/info"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.userDropdown__link}
                                    >
                                        Personal Information
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="https://account.sap.com/manage/security"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.userDropdown__link}
                                    >
                                        Security
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="https://account.sap.com/manage/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.userDropdown__link}
                                    >
                                        Privacy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    )}

                    {user.provider === 'github' && (
                        <div className={styles.userDropdown__section}>
                            <h3 className={styles.userDropdown__sectionTitle}>
                                <a
                                    href={`https://github.com/${user.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.userDropdown__titleLink}
                                >
                                    View my GitHub Profile
                                </a>
                            </h3>
                        </div>
                    )}

                    <div className={styles.userDropdown__logoutSection}>
                        <button onClick={logout} className={`button button--primary ${styles.logoutButtonLarge}`}>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
