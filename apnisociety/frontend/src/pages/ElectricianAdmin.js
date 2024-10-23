import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "./ElectricianAdmin.css";

const ElectricianAdmin = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch appointments from Firestore
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "electricianAppointments"));
        const appointmentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // Function to handle appointment status update
  const handleStatusChange = async (id, status) => {
    try {
      const appointmentRef = doc(db, "electricianAppointments", id);
      await updateDoc(appointmentRef, {
        appointmentStatus: status,
      });
      // Update local state to reflect change
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id ? { ...appointment, appointmentStatus: status } : appointment
        )
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  return (
    <div className="electrician-admin">
      <h2>Electrician Admin Panel</h2>
      <p>Manage electrician service requests and track ongoing tasks.</p>

      <div className="appointments-list">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="appointment-card">
            <p><strong>Name:</strong> {appointment.name}</p>
            <p><strong>Contact:</strong> {appointment.contact}</p>
            <p><strong>Appointment Date:</strong> {appointment.appointmentDate}</p>
            <p><strong>Wing:</strong> {appointment.wing}</p>
            <p><strong>Flat:</strong> {appointment.flat}</p>
            <p><strong>Status:</strong> {appointment.appointmentStatus}</p>
            <button onClick={() => handleStatusChange(appointment.id, "Confirmed")}>
              Confirm
            </button>
            <button onClick={() => handleStatusChange(appointment.id, "Cancelled")}>
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectricianAdmin;
