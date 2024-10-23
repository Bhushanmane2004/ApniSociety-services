import React, { useState, useEffect } from "react";
import "./GuestInOut.css";
import { db, storage } from "./firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

const GuestInOut = () => {
  const [guestHistory, setGuestHistory] = useState([]);
  const [flatNumbers, setFlatNumbers] = useState([]);

  const fetchUsersFlatNumbers = async () => {
    try {
      const userList = [];
      const querySnapshot = await getDocs(collection(db, "users"));

      for (const docSnap of querySnapshot.docs) {
        const userData = docSnap.data();
        if (userData.flatNo) {
          userList.push(userData.flatNo);
        }
      }

      setFlatNumbers(userList);
    } catch (error) {
      console.error("Error fetching users flat numbers:", error);
    }
  };

  const fetchGuestHistory = async () => {
    try {
      const guestList = [];
      const querySnapshot = await getDocs(collection(db, "guestHistory"));

      for (const docSnap of querySnapshot.docs) {
        const guestData = docSnap.data();
        let imageUrl = null;

        if (guestData.imageName) {
          const imageRef = ref(storage, `guestImages/${guestData.imageName}`);
          imageUrl = await getDownloadURL(imageRef);
        }

        if (flatNumbers.includes(guestData.flatNumber)) {
          guestList.push({ id: docSnap.id, ...guestData, imageUrl });
        }
      }

      setGuestHistory(guestList);
    } catch (error) {
      console.error("Error fetching guest history:", error);
    }
  };

  const handleApproval = async (guestId, status) => {
    try {
      const guestRef = doc(db, "guestHistory", guestId);
      await updateDoc(guestRef, { status });

      fetchGuestHistory();
    } catch (error) {
      console.error("Error updating guest status:", error);
    }
  };

  useEffect(() => {
    fetchUsersFlatNumbers();
  }, []);

  useEffect(() => {
    if (flatNumbers.length > 0) {
      fetchGuestHistory();
    }
  }, [flatNumbers]);

  return (
    <div className="guest-in-out">
      <h2>Guest In/Out History</h2>
      <div className="guest-list">
        {guestHistory.length === 0 ? (
          <p>No guest records found.</p>
        ) : (
          guestHistory.map((guest) => (
            <div key={guest.id} className="guest-item">
              {guest.imageUrl && <img src={guest.imageUrl} alt="Guest" className="guest-image" />}
              <div className="guest-info">
                <p><strong>Name:</strong> {guest.name}</p>
                <p><strong>Contact:</strong> {guest.contact}</p>
                <p><strong>Purpose:</strong> {guest.purpose}</p>
                <p><strong>Flat Number:</strong> {guest.flatNumber || "N/A"}</p>
                <p><strong>Status:</strong> {guest.status || "Pending"}</p>
                <button onClick={() => handleApproval(guest.id, "Approved")}>Approve</button>
                <button onClick={() => handleApproval(guest.id, "Rejected")}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuestInOut;
