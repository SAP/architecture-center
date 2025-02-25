import React, { ReactNode } from "react";
import styles from "./TeamProfileCard.module.css";

interface ProfileProps {
  className?: string;
  name: string;
  description?: string;
  children?: ReactNode;
  githubUrl?: string;
  profileUrl?: string;
}

function TeamProfileCard({ className, name, description, children, githubUrl, profileUrl }: ProfileProps) {
  // Extract the username from the githubUrl
  const avatarUrl = githubUrl ? `https://github.com/${githubUrl.split("/").pop()}.png` : undefined;

  return (
    <div className={`${styles["team-profile-card"]} ${className || ""}`}>
      <div className={styles["team-profile-card__container"]}>
        {avatarUrl && (
          <img className={styles["team-profile-card__avatar"]} src={avatarUrl} alt={name} />
        )}
        {children}
        <h5 className={styles["team-profile-card__name"]}>{name}</h5><br/>
        {description && <p className={styles["team-profile-card__description"]}>{description}</p>}
        <div className={styles["team-profile-card__buttons"]}>
          {githubUrl && (
            <a className={styles["team-profile-card__button"]} href={githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {profileUrl && (
            <a className={`${styles["team-profile-card__button"]} ${styles["linkedin-button"]}`} 
            href={profileUrl} target="_blank" rel="noopener noreferrer">
              SAP Profile
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function CoreTeam(): ReactNode {
  return (
    <div className={styles["team-profile-container"]}>
      <TeamProfileCard
        name="Sangeetha Krishnamoorthy"
        description="Solution Architect"
        githubUrl="https://github.com/s-krishnamoorthy"
        profileUrl="https://people.wdf.sap.corp/profiles/I863312"
      />
      
      <TeamProfileCard 
        name='Mahesh Palavalli'
        description="Solution Architect" 
        githubUrl="https://github.com/mahesh0431"
        profileUrl="https://people.wdf.sap.corp/profiles/I562188"
      />
      
      <TeamProfileCard 
        name='Pierre-Olivier "PO" Basseville' 
        description="Architecture Center Co-Lead"
        githubUrl="https://github.com/cernus76"
        profileUrl="https://people.wdf.sap.corp/profiles/I057866"
      />
    </div>
  );
}

export default { CoreTeam };
