import React, { useEffect, useState } from "react";
import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "./kiranAdmin.css";

const KiranaAdmin = () => {
  const [orders, setOrders] = useState([]);

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      const ordersCollection = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersCollection);
      const ordersList = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    };

    fetchOrders();
  }, []);

  // Function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
      });
      alert("Order status updated!");
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Kirana Admin - Orders</h2>
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No orders available</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>Order ID: {order.id}</h3>
              <p><strong>User ID:</strong> {order.userId}</p>
              <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Products:</strong></p>
              <ul>
                {order.products.map((product, index) => (
                  <li key={index}>
                    {product.name} - ₹{product.price}/{product.unit}
                  </li>
                ))}
              </ul>
              <div className="status-update-section">
                <label htmlFor="status">Update Status: </label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KiranaAdmin;
