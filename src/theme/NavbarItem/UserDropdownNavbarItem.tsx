import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@site/src/context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Icon, Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/person-placeholder.js';
import '@ui5/webcomponents-icons/dist/decline.js';
import '@ui5/webcomponents-icons/dist/log.js';
import styles from './UserDropdownNavbarItem.module.css';
import Link from '@docusaurus/Link';

export default function UserDropdownNavbarItem() {
    const { user, users, loading, logout, hasDualLogin } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const { backendUrl, expressBackendUrl } = siteConfig.customFields as {
        backendUrl: string;
        expressBackendUrl: string;
    };
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

    // const handleLogin = (provider: 'btp' | 'github') => {
    //     window.location.href = `${backendUrl}/user/login?origin_uri=${encodeURIComponent(
    //         window.location.href
    //     )}&provider=${provider}`;
    // };

    const handleLogin = (provider: 'btp' | 'github') => {
        const originUri = encodeURIComponent(window.location.href);

        if (provider === 'github') {
            window.location.href = `${expressBackendUrl}/user/login?origin_uri=${originUri}&provider=${provider}`;
        } else {
            window.location.href = `${backendUrl}/user/login?origin_uri=${originUri}&provider=${provider}`;
        }
    };

    if (!user) {
        if (loading) {
            return <div className={styles.loadingPlaceholder}></div>;
        }

        return (
            <div className={`navbar__item ${styles.userDropdown}`} ref={dropdownRef}>
                <Button design="Transparent" onClick={toggleDropdown} className={styles.loginButton}>
                    <Icon name="person-placeholder"></Icon>
                </Button>
                {isDropdownOpen && (
                    <div
                        className={`${styles.userDropdown__content} ${styles.userDropdown__contentOpen} ${styles.loginOptions}`}
                    >
                        <Button
                            design="Emphasized"
                            onClick={() => handleLogin('btp')}
                            className={styles.loginOptionButton}
                        >
                            Login with SAP
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
                <div
                    className={`${styles.userDropdown__content} ${styles.userDropdown__contentOpen} ${
                        hasDualLogin ? styles.dualLoginLayout : ''
                    }`}
                >
                    {hasDualLogin ? (
                        <div className={styles.dualLoginVerticalContainer}>
                            {users.github && (
                                <div className={styles.accountRow}>
                                    <div className={styles.accountInfo}>
                                        {users.github.avatar ? (
                                            <img
                                                src={users.github.avatar}
                                                alt={users.github.username}
                                                className={styles.accountIcon}
                                            />
                                        ) : (
                                            <div className={styles.accountIconPlaceholder}>GH</div>
                                        )}
                                        <div className={styles.accountDetails}>
                                            <span className={styles.accountName}>{users.github.username}</span>
                                            <span className={styles.accountProvider}>GitHub</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => logout('github')}
                                        className={styles.crossButton}
                                        title="Logout from GitHub"
                                    >
                                        <Icon name="log" />
                                    </button>
                                </div>
                            )}

                            {users.btp && (
                                <div className={styles.accountRow}>
                                    <div className={styles.accountInfo}>
                                        <div className={styles.accountIconPlaceholder}>
                                            {users.btp.username?.substring(0, 2).toUpperCase() || 'BT'}
                                        </div>
                                        <div className={styles.accountDetails}>
                                            <span className={styles.accountName}>{users.btp.username}</span>
                                            <span className={styles.accountProvider}>SAP</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => logout('btp')}
                                        className={styles.crossButton}
                                        title="Logout from SAP"
                                    >
                                        <Icon name="log" />
                                    </button>
                                </div>
                            )}

                            {/* Logout All Button */}
                            <div className={styles.logoutAllSection}>
                                <Button
                                    design="Default"
                                    onClick={() => logout('all')}
                                    className={styles.logoutAllButton}
                                >
                                    Logout All
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Single login layout - original design
                        <>
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
                                <Button
                                    design="Emphasized"
                                    onClick={() => logout(user.provider)}
                                    className={styles.logoutButtonLarge}
                                >
                                    Logout
                                </Button>

                                {/* Add login button for the other provider */}
                                {user.provider === 'btp' && !users.github && (
                                    <Button
                                        design="Default"
                                        onClick={() => handleLogin('github')}
                                        className={styles.additionalLoginButton}
                                    >
                                        Login with GitHub
                                    </Button>
                                )}

                                {user.provider === 'github' && !users.btp && (
                                    <Button
                                        design="Default"
                                        onClick={() => handleLogin('btp')}
                                        className={styles.additionalLoginButton}
                                    >
                                        Login with SAP
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
