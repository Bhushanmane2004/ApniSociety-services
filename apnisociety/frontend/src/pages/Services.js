import React, { useState } from "react";
import "./Services.css";
import KiranaStore from "./KiranaStore";
import KiranaAdmin from "./kirnaadmin";
import ElectricianServices from "./ElectricianServices"; // Import Electrician Services component
import ElectricianAdmin from "./ElectricianAdmin"; // Import Electrician Admin component
import SecurityInOut from "./SecurityInOut"; // Import Security In/Out component

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { title: "Cleaning", description: "Schedule and manage cleaning services." },
    { title: "Plumbing", description: "Request plumbing services for your unit." },
    { title: "Electrician", description: "Get help with electrical issues." },
    { title: "Electrician Admin", description: "Admin panel to manage electrician requests." }, // Electrician Admin added
    { title: "Gardening", description: "Book a gardener for your lawn care." },
    { title: "Grocery", description: "Order groceries and get them delivered." },
    { title: "Kirana Store", description: "Order daily essentials from the local Kirana store." },
    { title: "Kirana Admin", description: "Admin panel to manage Kirana store products and orders." },
    { title: "Security In/Out", description: "Manage security in/out records for guests and visitors." } // New Security In/Out service
  ];

  const handleServiceClick = (service) => {
    if (service.title === "Kirana Store") {
      setSelectedService("KiranaStore");
    } else if (service.title === "Kirana Admin") {
      setSelectedService("KiranaAdmin");
    } else if (service.title === "Electrician") {
      setSelectedService("ElectricianServices"); // Show ElectricianServices component
    } else if (service.title === "Electrician Admin") {
      setSelectedService("ElectricianAdmin"); // Show ElectricianAdmin component
    } else if (service.title === "Security In/Out") {
      setSelectedService("SecurityInOut"); // Show SecurityInOut component
    } else {
      setSelectedService(service);
    }
  };

  const handleBackClick = () => {
    setSelectedService(null);
  };

  return (
    <div className="services-section">
      {!selectedService ? (
        <>
          <h2>Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card" onClick={() => handleServiceClick(service)}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <button className="service-btn">View Details</button>
              </div>
            ))}
          </div>
        </>
      ) : selectedService === "KiranaStore" ? (
        <KiranaStore />
      ) : selectedService === "KiranaAdmin" ? (
        <KiranaAdmin />
      ) : selectedService === "ElectricianServices" ? (
        <ElectricianServices />
      ) : selectedService === "ElectricianAdmin" ? (
        <ElectricianAdmin />
      ) : selectedService === "SecurityInOut" ? (
        <SecurityInOut /> // Render SecurityInOut component when selected
      ) : (
        <div className="service-details">
          <h3>{selectedService.title}</h3>
          <p>{selectedService.description}</p>
          <button className="back-btn" onClick={handleBackClick}>
            Back to Services
          </button>
        </div>
      )}
    </div>
  );
};

export default Services;
