import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faUserCircle, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "./firebaseConfig"; // Firebase configuration including storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase storage functions
import "./UserProfile.css"; // Import CSS

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: "Anonymous",
    email: "",
    phone: "",
    flatNo: "",
    society: "",
    profileImage: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userData });
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null); // New state for image file
  const auth = getAuth();

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, "Users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userDataFromFirestore = userDoc.data();
        setUserData({
          ...userDataFromFirestore,
        });
        setFormData({
          ...userDataFromFirestore,
        });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image file change
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Upload the image to Firebase Storage and return the URL
  const uploadImageToStorage = async (uid, imageFile) => {
    try {
      const imageRef = ref(storage, `profileImages/${uid}`);
      await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("Failed to upload image. Try again.");
      return null;
    }
  };

  // Handle saving the updated data to Firestore
  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        let updatedFormData = { ...formData };

        // If a new image is selected, upload it and get the URL
        if (imageFile) {
          const imageUrl = await uploadImageToStorage(user.uid, imageFile);
          if (imageUrl) {
            updatedFormData.profileImage = imageUrl;
          }
        }

        const userDocRef = doc(db, "Users", user.uid);
        await updateDoc(userDocRef, updatedFormData);
        setUserData({ ...updatedFormData });
        setIsEditing(false);
        setMessage("Profile updated successfully!");
        setImageFile(null); // Reset image file after successful update
      } catch (error) {
        console.error("Error updating user profile:", error);
        setMessage("Failed to update profile. Try again.");
      }
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchUserProfile(user.uid);
    }
  }, [auth]);

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-image">
          {userData.profileImage ? (
            <img src={userData.profileImage} alt="Profile" />
          ) : (
            <FontAwesomeIcon icon={faUserCircle} size="6x" />
          )}
          {isEditing && (
            <label className="upload-icon">
              <FontAwesomeIcon icon={faUpload} />
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
          )}
          {/* Display a preview of the selected image */}
          {imageFile && (
            <div className="image-preview">
              <img src={URL.createObjectURL(imageFile)} alt="Selected" />
              <p>{imageFile.name}</p>
            </div>
          )}
        </div>
        <h2>{isEditing ? "Edit Profile" : userData.name}</h2>
        <FontAwesomeIcon
          icon={isEditing ? faSave : faEdit}
          className="edit-icon"
          onClick={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
        />
      </div>

      {/* Show a success or error message after an update attempt */}
      {message && <p className="update-message">{message}</p>}

      <div className="profile-details">
        <div className="detail-item">
          <strong>Email:</strong>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userData.email || "Not Provided"}</p>
          )}
        </div>
        <div className="detail-item">
          <strong>Phone:</strong>
          {isEditing ? (
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userData.phone || "Not Provided"}</p>
          )}
        </div>
        <div className="detail-item">
          <strong>Flat No:</strong>
          {isEditing ? (
            <input
              type="text"
              name="flatNo"
              value={formData.flatNo}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userData.flatNo || "Not Provided"}</p>
          )}
        </div>
        <div className="detail-item">
          <strong>Society:</strong>
          {isEditing ? (
            <input
              type="text"
              name="society"
              value={formData.society}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userData.society || "Not Provided"}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
