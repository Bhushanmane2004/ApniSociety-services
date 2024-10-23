import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "./firebaseConfig"; // Adjust the path according to your structure
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import "./KiranaStore.css";

const KiranaStore = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false); // For toggling the cart
  const [orders, setOrders] = useState([]); // For storing order history

  // Fetch products from Firebase on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, "products");
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  // Fetch order history for the user
  useEffect(() => {
    const fetchOrders = async () => {
      // Replace the below query with appropriate user details
      const ordersCollection = collection(db, "orders");
      const q = query(ordersCollection, where("email", "==", "testuser@example.com")); // Filter by user email
      const orderSnapshot = await getDocs(q);
      const orderList = orderSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setOrders(orderList);
    };

    fetchOrders();
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, product) => total + product.price, 0);
  };

  const handlePayment = async () => {
    try {
      const totalAmount = calculateTotal();
      // Call the server to create a Razorpay order
      const res = await axios.get(`http://localhost:5000/pay?amount=${totalAmount}`);
      const { orderId, key_id, amount, currency } = res.data;

      // Create options for the Razorpay payment gateway
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Kirana Store",
        description: "Test Transaction",
        order_id: orderId,
        handler: async function (response) {
          alert("Payment Successful!");

          // Create an order document in Firestore
          try {
            await addDoc(collection(db, "orders"), {
              products: cart, // Store the cart items
              totalAmount: totalAmount,
              orderId: response.razorpay_order_id, // Razorpay order ID
              userName: "Test User", // You can dynamically get the user details
              email: "testuser@example.com", // Example email
              status: "Pending", // Initial order status
              createdAt: new Date(),
            });
            console.log("Order successfully added to Firestore!");
          } catch (error) {
            console.error("Error adding order to Firestore:", error);
          }

          // Clear the cart after successful payment
          setCart([]);
        },
        prefill: {
          name: "Test User",
          email: "testuser@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      // Open Razorpay payment window
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error in payment:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="kirana-store-section">
      <h2>Kirana Store</h2>

      {/* Toggle button for cart */}
      <button className="toggle-cart-btn" onClick={() => setShowCart(!showCart)}>
        {showCart ? "Hide Cart" : "Show Cart"}
      </button>

      {/* Conditionally render cart based on showCart state */}
      {showCart && (
        <div className="cart-section">
          <h2>Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li key={item.id} className="cart-item">
                  {item.name} - ₹{item.price}/{item.unit}
                  <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <h3>Total: ₹{calculateTotal()}</h3>
          {cart.length > 0 && <button onClick={handlePayment}>Proceed to Payment</button>}
        </div>
      )}

      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>Price: ₹{product.price}/{product.unit}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Display order history */}
      <div className="order-history">
        <h2>Your Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order.id} className="order-item">
                <h3>Order ID: {order.orderId}</h3>
                <p>Total Amount: ₹{order.totalAmount}</p>
                <p>Status: {order.status}</p> {/* Show order status */}
                <p>Ordered on: {new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
                <ul>
                  {order.products.map((product, index) => (
                    <li key={index}>
                      {product.name} - ₹{product.price} ({product.unit})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default KiranaStore;
