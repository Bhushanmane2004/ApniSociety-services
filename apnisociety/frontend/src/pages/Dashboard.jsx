import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Services from "./Services";
import Maintainess from "./maintainess";
import UserProfile from "./UserProfile";
import GuestInOut from "./GuestInOut";
import {
  faSignInAlt,
  faConciergeBell,
  faUser,
  faCog,
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Firebase config file
import NoticeBoard from "./NoticeBoard"; // NoticeBoard component
import "./Dashboard.css"; // Dashboard specific styling

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentFragment, setCurrentFragment] = useState("NoticeBoard"); // Track the current fragment to render
  const [showSubMenu, setShowSubMenu] = useState(false); // For future sub-menu functionality
  const [username, setUsername] = useState("Anonymous");
  const [userId, setUserId] = useState(null);
  const auth = getAuth();

  // Fetch username from Firebase Firestore using UID
  const fetchUsername = async (uid) => {
    try {
      const userDocRef = doc(db, "Users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUsername(userDoc.data().name || "Anonymous");
        setUserId(uid);
      } else {
        console.log("No user document found!");
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  // Monitor authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUsername(user.uid);
      } else {
        setUsername("Anonymous");
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Toggle submenu functionality
  const toggleSubMenu = () => setShowSubMenu((prev) => !prev);

  // Handle navigation for the Maintenance component
  const handleMaintenanceClick = () => {
    navigate("/maintainess"); // Navigate to the Maintainess route
  };

  // Conditionally render the current fragment based on user selection
  const renderFragment = () => {
    switch (currentFragment) {
      case "NoticeBoard":
        return <NoticeBoard username={username} userId={userId} />;
      case "GuestInOut":
        return <GuestInOut />;
      case "Maintainess":
        return <Maintainess />;
      case "Services":
        return   <Services />;
      case "UserProfile":
        return<UserProfile />;
      default:
        return <div>Select a feature</div>;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-top">
            <div className="feature" onClick={() => setCurrentFragment("NoticeBoard")}>
              <FontAwesomeIcon icon={faClipboard} />
              <p>Notice Board</p>
            </div>
            <div className="feature" onClick={() => setCurrentFragment("GuestInOut")}>
              <FontAwesomeIcon icon={faSignInAlt} />
              <p>Guest In/Out</p>
            </div>
            <div className="feature" onClick={() => setCurrentFragment("Maintainess")}> {/* Updated to navigate to Maintainess */}
              <FontAwesomeIcon icon={faConciergeBell} />
              <p>Maintenance</p>
            </div>
            <div className="feature" onClick={() => setCurrentFragment("Services")}>
              <FontAwesomeIcon icon={faCog} />
              <p>Services</p>
            </div>
            <div className="feature" onClick={() => setCurrentFragment("UserProfile")}>
              <FontAwesomeIcon icon={faUser} />
              <p>User Profile</p>
            </div>
          </div>

          
          {showSubMenu && (
            <div className="submenu">
              <p>Account Settings</p>
             
            </div>
          )}
        </div>
      </div>

      <div className="fragment-render">
        {renderFragment()}
      </div>
    </div>
  );
};

export default Dashboard;
