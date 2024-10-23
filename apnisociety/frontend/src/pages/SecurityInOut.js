import React, { useState, useEffect } from "react";
import "./SecurityInOut.css";
import { db, storage } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

const SecurityInOut = () => {
  const [guestName, setGuestName] = useState("");
  const [contact, setContact] = useState("");
  const [purpose, setPurpose] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [image, setImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [guestRequests, setGuestRequests] = useState([]);

  // Handle image change
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Fetch guest entries from Firestore
  const fetchGuestRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "guestHistory"));
      const guests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGuestRequests(guests);
    } catch (error) {
      console.error("Error fetching guest entries:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const guestDocRef = await addDoc(collection(db, "guestHistory"), {
        name: guestName,
        contact,
        purpose,
        flatNumber,
        imageName: image ? image.name : null,
        status: "Pending", // Default status
      });

      if (image) {
        const imageRef = ref(storage, `guestImages/${image.name}`);
        await uploadBytes(imageRef, image);
      }

      setSuccessMessage("Guest entry added successfully!");
      setGuestName("");
      setContact("");
      setPurpose("");
      setFlatNumber("");
      setImage(null);

      fetchGuestRequests();
    } catch (error) {
      console.error("Error adding guest entry:", error);
    }
  };

  // Fetch guest requests on component mount
  useEffect(() => {
    fetchGuestRequests();
  }, []);

  return (
    <div className="security-in-out">
      <h2>Security In/Out Management</h2>

      {/* Form for adding a new guest entry */}
      <form onSubmit={handleSubmit} className="guest-form">
        <input
          type="text"
          placeholder="Guest Name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Purpose of Visit"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Flat Number"
          value={flatNumber}
          onChange={(e) => setFlatNumber(e.target.value)}
          required
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit">Add Guest Entry</button>
      </form>

      {/* Success message after submission */}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {/* List of guest requests with status */}
      <h2>Guest Entry Requests</h2>
      <div className="guest-requests-list">
        {guestRequests.length === 0 ? (
          <p>No guest requests found.</p>
        ) : (
          guestRequests.map((guest) => (
            <div key={guest.id} className="guest-request-item">
              <p><strong>Name:</strong> {guest.name}</p>
              <p><strong>Contact:</strong> {guest.contact}</p>
              <p><strong>Purpose:</strong> {guest.purpose}</p>
              <p><strong>Flat Number:</strong> {guest.flatNumber}</p>
              <p><strong>Status:</strong> {guest.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SecurityInOut;
