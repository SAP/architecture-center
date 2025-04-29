import React, { ReactNode } from 'react';
import styles from './TeamProfileCard.module.css';

interface ProfileProps {
    className?: string;
    name: string;
    description?: string;
    children?: ReactNode;
    githubUrl?: string;
    linkedinUrl?: string;
}

function TeamProfileCard({ className, name, description, children, githubUrl, linkedinUrl }: ProfileProps) {
    // Extract the username from the githubUrl
    const avatarUrl = githubUrl ? `https://github.com/${githubUrl.split('/').pop()}.png` : undefined;

    return (
        <div className={`${styles['team-profile-card']} ${className || ''}`}>
            <div className={styles['team-profile-card__container']}>
                {avatarUrl && <img className={styles['team-profile-card__avatar']} src={avatarUrl} alt={name} />}
                {children}
                <h5 className={styles['team-profile-card__name']}>{name}</h5>
                <br />
                {description && <p className={styles['team-profile-card__description']}>{description}</p>}
                <div className={styles['team-profile-card__buttons']}>
                    {githubUrl && (
                        <a
                            className={styles['team-profile-card__button']}
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    )}
                    {linkedinUrl && (
                        <a
                            className={`${styles['team-profile-card__button']} ${styles['linkedin-button']}`}
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LinkedIn
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export function CoreTeam(): ReactNode {
    return (
        <div className={styles['team-profile-container']}>
            <TeamProfileCard
                name="Navya Khurana"
                description="Research & Development / GitHub actions black-belt"
                githubUrl="https://github.com/navyakhurana"
                linkedinUrl="https://www.linkedin.com/in/navya-khurana-1b78a6187/"
            />

            <TeamProfileCard
                name='James "Jim" Rapp'
                description="Research, Development & more / Co-Lead"
                githubUrl="https://github.com/jmsrpp"
                linkedinUrl="https://www.linkedin.com/in/james-rapp"
            />

            <TeamProfileCard
                name='Pierre-Olivier "PO" Basseville'
                description="Research, Development & Testing / Co-Lead"
                githubUrl="https://github.com/cernus76"
                linkedinUrl="https://www.linkedin.com/in/pierreolivierbasseville/"
            />
        </div>
    );
}

export function ExtendedTeam(): ReactNode {
    return (
        <div className={styles['team-profile-container']}>
            <TeamProfileCard
                name="Johanna Gonzalez"
                description="Design & Development / SAP UI5 integration"
                githubUrl="https://github.com/johannagonnzdz"
                linkedinUrl="https://www.linkedin.com/in/johannagondi/"
            />

            <TeamProfileCard
                name="Julian Schambeck"
                description="Research & Development / drawio integration"
                githubUrl="https://github.com/julian-schambeck"
                linkedinUrl="https://www.linkedin.com/in/julian-s-41b9a8253/"
            />

            <TeamProfileCard
                name="Gabriel Kevorkian"
                description="Research & Development / Docusaurus black-belt"
                githubUrl="https://github.com/g-kevorkian"
                linkedinUrl="https://www.linkedin.com/in/gabriel-kevorkian-30005b2/"
            />

            <TeamProfileCard
                name="Robin Purschwitz"
                description="Research & Development"
                githubUrl="https://github.com/RobinPurschwitz"
            />

            <TeamProfileCard
                name="Max Lienhardt"
                description="Research & Development"
                githubUrl="https://github.com/xammaxx"
            />
        </div>
    );
}

export default { CoreTeam, ExtendedTeam };
