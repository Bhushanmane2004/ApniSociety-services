import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import "./ElectricianServices.css";

const ElectricianServices = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [wing, setWing] = useState("");
  const [flat, setFlat] = useState("");
  const [message, setMessage] = useState("");
  const [appointments, setAppointments] = useState([]); // Store fetched appointments
  const [loading, setLoading] = useState(false);

  // Function to handle form submission
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    if (name && contact && appointmentDate && wing && flat) {
      try {
        // Add appointment to Firestore with "Pending" status
        await addDoc(collection(db, "electricianAppointments"), {
          name: name,
          contact: contact,
          appointmentDate: appointmentDate,
          wing: wing,
          flat: flat,
          appointmentStatus: "Pending", // Initial status
          createdAt: new Date(),
        });
        setMessage("Your appointment has been booked successfully!");
        setName("");
        setContact("");
        setAppointmentDate("");
        setWing("");
        setFlat("");
        fetchAppointments(); // Refresh the appointment list
      } catch (error) {
        console.error("Error booking appointment: ", error);
        setMessage("Failed to book appointment. Please try again.");
      }
    } else {
      setMessage("Please fill all fields.");
    }
  };

  // Function to fetch user's appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "electricianAppointments"));
      const appointmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  // Function to cancel an appointment
  const handleCancelAppointment = async (id) => {
    try {
      await deleteDoc(doc(db, "electricianAppointments", id));
      setMessage("Appointment cancelled successfully!");
      fetchAppointments(); // Refresh the appointment list
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setMessage("Failed to cancel appointment. Please try again.");
    }
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="electrician-services">
      <h2>Electrician Services</h2>
      <p>Request electrician services for various electrical issues in your home.</p>
      <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Contact Number:</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            placeholder="Enter your contact number"
          />
        </div>
        <div className="form-group">
          <label>Preferred Appointment Date:</label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Wing:</label>
          <input
            type="text"
            value={wing}
            onChange={(e) => setWing(e.target.value)}
            required
            placeholder="Enter Wing (e.g., A, B)"
          />
        </div>
        <div className="form-group">
          <label>Flat:</label>
          <input
            type="text"
            value={flat}
            onChange={(e) => setFlat(e.target.value)}
            required
            placeholder="Enter Flat Number"
          />
        </div>
        <button type="submit" className="request-service-btn">
          Book Appointment
        </button>
      </form>
      {message && <p className="appointment-message">{message}</p>}

      <h3>Your Appointments</h3>
      {loading ? (
        <p>Loading your appointments...</p>
      ) : appointments.length > 0 ? (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <p><strong>Name:</strong> {appointment.name}</p>
              <p><strong>Contact:</strong> {appointment.contact}</p>
              <p><strong>Appointment Date:</strong> {appointment.appointmentDate}</p>
              <p><strong>Wing:</strong> {appointment.wing}</p>
              <p><strong>Flat:</strong> {appointment.flat}</p>
              <p><strong>Status:</strong> {appointment.appointmentStatus}</p>
              {appointment.appointmentStatus === "Pending" && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
};

export default ElectricianServices;
