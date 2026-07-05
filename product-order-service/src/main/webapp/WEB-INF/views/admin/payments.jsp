<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!DOCTYPE html>

<html>

<head>

    <title>Payments Management</title>

    <link rel="stylesheet" href="/css/theme.css">
    <link rel="stylesheet" href="/css/dashboard.css">

</head>

<body>

<div class="sidebar">

    <h2>E-Commerce</h2>

    <a href="/">Dashboard</a>

    <a href="/products-ui">Products</a>

    <a href="/orders-ui">Orders</a>

    <a href="/payments-ui">Payments</a>

    <a href="/wallet-ui">Wallet</a>

</div>

<div class="main-content">

    <h1>Payments Management</h1>

    <!-- Search By Payment ID -->

    <div class="card">

        <h3>Search Payment</h3>

        <input
                id="paymentId"
                placeholder="Payment ID">

        <br><br>

        <button onclick="getPayment()">
            Search Payment
        </button>

    </div>

    <br>

    <!-- Search By User -->

    <div class="card">

        <h3>Payment History</h3>

        <input
                id="userId"
                placeholder="User ID">

        <br><br>

        <button onclick="getPaymentsByUser()">
            Load History
        </button>

    </div>

    <br>

    <!-- Table -->

    <div class="card">

        <table border="1" width="100%">

            <thead>

            <tr>

                <th>Payment ID</th>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment ID</th>

            </tr>

            </thead>

            <tbody id="paymentTableBody">

            </tbody>

        </table>

    </div>

    <br>

    <!-- Console -->

    <div
            id="console"
            class="console">

        [INFO] Payments Console Ready

    </div>

</div>

<script src="/js/payments.js"></script>

</body>

</html>