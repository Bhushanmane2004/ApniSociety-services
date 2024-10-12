import { useState, useEffect } from 'react';
import axios from 'axios';
import './Maintainess.css';

function Maintainess() {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]); // State for multiple selected payments
  const [dummyPayments, setDummyPayments] = useState([
    { id: 1, amount: 200, description: 'Payment for Maintenance', date: '2024-10-01' },
    { id: 2, amount: 150, description: 'Payment for Cleaning Service', date: '2024-10-05' },
    { id: 3, amount: 300, description: 'Payment for Repair Work', date: '2024-10-10' },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPaymentId, setSelectedPaymentId] = useState(''); // State for the selected payment ID

  useEffect(() => {
    // Calculate total amount when dummyPayments change
    const total = dummyPayments.reduce((sum, payment) => sum + payment.amount, 0);
    setTotalAmount(total);
  }, [dummyPayments]);

  const handlePaymentSelect = (event) => {
    const selectedId = event.target.value; // Get the selected ID
    setSelectedPaymentId(selectedId); // Update the selected payment ID state
  };

  const calculateTotal = () => {
    const selectedPayment = dummyPayments.find(payment => payment.id === parseInt(selectedPaymentId));
    return selectedPayment ? selectedPayment.amount : totalAmount; // Use selected payment amount if available
  };

  const handleClick = async () => {
    const totalToPay = calculateTotal();
    if (totalToPay === 0) {
      setPaymentStatus('Please select a payment to proceed.');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/pay?amount=${totalToPay}`);
      console.log('Payment Response:', res.data);

      const { orderId, key_id, amount: orderAmount, currency } = res.data;

      const options = {
        key: key_id,
        amount: orderAmount,
        currency: currency,
        name: 'Your Company Name',
        description: `Total Payment for ${selectedPayments.length} items`,
        order_id: orderId,
        handler: function (response) {
          console.log('Payment successful!', response);
          setPaymentStatus('Payment Successful!');

          const newPayment = {
            id: dummyPayments.length + 1,
            amount: orderAmount / 100,
            description: `Total Payment for ${selectedPayments.length} items`,
            date: new Date().toLocaleDateString(),
          };
          setDummyPayments((prev) => [newPayment, ...prev]);
          setSelectedPayments([]); // Reset selected payments
          setSelectedPaymentId(''); // Reset selected payment ID
        },
        prefill: {
          name: 'Your Name',
          email: 'yourname@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
        method: {
          upi: true,
        },
        upi: {
          vpa: '',
          flow: 'intent',
        },
      };

      if (window.Razorpay) {
        const rzp1 = new window.Razorpay(options);
        rzp1.open();

        rzp1.on('payment.failed', function (response) {
          console.log('Payment failed:', response.error);
          setPaymentStatus('Payment Failed. Please try again.');
        });
      } else {
        console.error('Razorpay SDK not loaded');
        setPaymentStatus('Unable to initiate payment. Please try again later.');
      }

    } catch (error) {
      if (error.response && error.response.status === 429) {
        setPaymentStatus('Too many requests, please wait before trying again.');
      } else {
        console.error('Error in payment:', error);
        setPaymentStatus('Payment failed. Please try again.');
      }
    }
  };

  return (
    <div className="maintainess">
      <h1>Razorpay UPI Intent Integration</h1>

      <select className="select-payment" onChange={handlePaymentSelect} value={selectedPaymentId}>
        <option value="">Select a payment</option>
        {dummyPayments.map(payment => (
          <option key={payment.id} value={payment.id}>
            ₹{payment.amount} - {payment.description}
          </option>
        ))}
      </select>

      <button className="button" onClick={handleClick}>
        {selectedPaymentId ? `Pay ₹${dummyPayments.find(payment => payment.id === parseInt(selectedPaymentId)).amount}` : 'Pay Total'} {/* Change button text based on selection */}
      </button>

      {paymentStatus && (
        <div className="payment-status">
          <h3>{paymentStatus}</h3>
        </div>
      )}

      <div className="dummy-payments">
        <h3>Dummy Payments</h3>
        {dummyPayments.length === 0 ? (
          <p>No payments available.</p>
        ) : (
          <ul>
            {dummyPayments.map((payment) => (
              <li key={payment.id}>
                {payment.date}: ₹{payment.amount} - {payment.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Maintainess;
