const axios = require("axios");
const crypto = require("crypto");
const db = require("../models/db");

// Paynamics credentials
const merchant_id = "00000008082498E6FD39";
const merchant_key = "645F2583D7F7A057590BF6B22E651F68";
const api_username = "negrosPGNO*%#";
const api_password = "s2NbycAU#0!s";

// Utility functions
const computeSHA512 = (data) => {
  return crypto.createHash("sha512").update(data).digest("hex");
};

const computeTransactionSignature = (transaction, merchantKey) => {
  const {
    merchantid,
    request_id = "",
    notification_url = "",
    response_url = "",
    cancel_url = "",
    collection_method = "",
    amount = "",
    currency = "",
    payment_notification_status = "",
    payment_notification_channel = "",
  } = transaction;

  const rawTrx = [
    merchantid,
    request_id,
    notification_url,
    response_url,
    cancel_url,
    collection_method,
    amount,
    currency,
    payment_notification_status,
    payment_notification_channel,
    merchantKey,
  ].join("");

  return computeSHA512(rawTrx);
};

// Function to generate unique Paynamics request ID (dummy implementation)
const generateUniquePaynamicsReqId = async () => {
  return `RESI-${Date.now()}${Math.floor(Math.random() * 10000)}`;
};

// Main function
exports.finalCheck = async (req, res) => {
  try {
    const category_id = req.params.category_id;
    const start_date = req.params.start_date;
    const end_date = req.params.end_date;
    const guest_id = req.params.guest_id;
    const roomId = req.params.roomId;

    const guestName = req.params.guestName;
    const guestPhone = req.params.guestPhone;
    const address = req.params.address;
    const userEmail = req.params.userEmail;

    console.log(userEmail);

    // Calculate the number of nights
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const numberOfNights = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    // Fetch room price per night
    const [room] = await db.query(
      "SELECT price_per_night FROM rooms WHERE id = ?",
      [roomId]
    );

    if (room.length === 0) {
      return res.status(400).json({ message: "Room not found." });
    }

    const pricePerNight = room[0].price_per_night;

    // Calculate total price
    const total_price = pricePerNight * numberOfNights;

    // Define the base query with final availability checks
    let query = `
      SELECT 
          r.id, 
          r.room_number, 
          r.room_floor, 
          r.capacity, 
          r.price_per_night, 
          r.bed_type, 
          r.note,
          c.id AS cat_id,
          c.name AS category_name, 
          c.description AS category_description, 
          c.image_url AS category_image
      FROM 
          rooms r
      INNER JOIN 
          categories c ON r.category_id = c.id
      LEFT JOIN 
          bookings b ON r.id = b.room_id AND b.status != 'Cancelled' AND (
              (b.check_in_date < ? AND b.check_out_date > ?) OR
              (b.check_out_date = ? AND TIME(b.check_out_date) > '12:00:00')
          )
      WHERE 
          r.availability = 1 AND
          b.id IS NULL
  `;

    // Array to store query parameters
    const queryParams = [end_date, start_date, start_date];

    // Filter by category if a specific category is selected
    if (category_id !== "all") {
      query += ` AND r.category_id = ?`;
      queryParams.push(category_id);
    }

    // Sort the results for a final check (e.g., by price or room number)
    query += ` ORDER BY r.price_per_night ASC, r.room_number ASC`;

    const [results] = await db.query(query, queryParams);

    // Return true if rooms are available, false otherwise
    const isAvailable = results.length > 0;

    if (isAvailable) {
      // Generate a unique `paynamics_req_id`
      const paynamics_req_id = await generateUniquePaynamicsReqId();

      // Insert into the bookings table
      const insertQuery = `
          INSERT INTO bookings 
          (room_id, category_id, guest_id, check_in_date, check_out_date, total_price, paynamics_req_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

      const insertParams = [
        roomId,
        category_id,
        guest_id,
        start_date,
        end_date,
        total_price,
        paynamics_req_id,
      ];

      await db.query(insertQuery, insertParams);

      // Prepare Paynamics transaction data
      const transaction = {
        merchantid: merchant_id,
        request_id: paynamics_req_id,
        notification_url: process.env.NOTIF_URL,
        response_url: "http://localhost:3001/success",
        cancel_url: "http://localhost:3001/cancel",
        collection_method: "",
        amount: total_price.toFixed(2),
        currency: "PHP",
        payment_notification_status: "1",
        payment_notification_channel: "1",
      };

      // Compute signatures
      const transaction_signature = computeTransactionSignature(
        transaction,
        merchant_key
      );

      const customer_info = {
        fname: guestName,
        lname: guestName,
        mname: "na",
        email: userEmail,
        phone: guestPhone,
        mobile: guestPhone,
        dob: "",
      };

      const customer_signature = computeSHA512(
        [
          customer_info.fname,
          customer_info.lname,
          customer_info.mname,
          customer_info.email,
          customer_info.phone,
          customer_info.mobile,
          customer_info.dob,
          merchant_key,
        ].join("")
      );

      // Add signatures to respective objects
      transaction.signature = transaction_signature;
      customer_info.signature = customer_signature;

      // Combine all data into one object
      const postData = {
        transaction,
        billing_info: {
          billing_address1: address,
          billing_address2: address,
          billing_city: address,
          billing_state: address,
          billing_zip: "1234",
          billing_country: "PH",
        },
        shipping_info: {
          shipping_address1: address,
          shipping_city: address,
          shipping_state: address,
          shipping_zip: "1234",
          shipping_country: "PH",
        },
        customer_info,
        order_details: {
          orders: [
            {
              itemname: "Hotel Booking",
              quantity: 1,
              unitprice: total_price.toFixed(2),
              totalprice: total_price.toFixed(2),
            },
          ],
          subtotalprice: total_price.toFixed(2),
          shippingprice: "0.00",
          discountamount: "0.00",
          totalorderamount: total_price.toFixed(2),
        },
      };

      // Make API request to Paynamics
      const apiUrl = "https://api.payserv.net/v1/rpf/transactions/rpf";

      const response = await axios.post(apiUrl, postData, {
        auth: {
          username: api_username,
          password: api_password,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.redirect_url) {
        res.status(200).json({
          isAvailable,
          redirect_url: response.data.redirect_url,
          paynamics_req_id,
        });
      } else {
        res.status(200).json({
          isAvailable,
          message: "No redirect URL provided in the response.",
        });
      }
    } else {
      res.status(200).json({ isAvailable });
    }
  } catch (error) {
    console.error("Error in final room availability check: ", error);
    res.status(500).json({
      message: "An error occurred during the final room availability check.",
    });
  }
};
