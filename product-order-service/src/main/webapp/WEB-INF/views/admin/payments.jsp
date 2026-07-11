<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!DOCTYPE html>

<html>

<head>

    <title>Payments Management</title>

    <link rel="stylesheet" href="/css/theme.css">
    <link rel="stylesheet" href="/css/dashboard.css">

</head>

<body>

<%@ include file="../fragments/admin-sidebar.jsp" %>

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
                id="paymentUserId"
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
                <th>Payment Date</th>

            </tr>

            </thead>

            <tbody id="paymentBody">

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

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script src="/js/customer-payments.js"></script>

</body>

</html>