<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page contentType="text/html;charset=UTF-8"
         pageEncoding="UTF-8"%>
<!DOCTYPE html>

<html>

<head>
<meta charset="UTF-8">
    <title>Orders Management</title>

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

    <h1>Orders Management</h1>

    <!-- CREATE ORDER -->

    <div class="card">

        <h3>Create Order</h3>

        <input
                id="userId"
                placeholder="User ID">

        <br><br>

        <input
                id="productId"
                placeholder="Product ID">

        <br><br>

        <input
                id="quantity"
                placeholder="Quantity">

        <br><br>

        <input
                id="totalAmount"
                placeholder="Total Amount">

        <br><br>

        <button onclick="createOrder()">
            Create Order
        </button>

    </div>

    <br>

    <!-- CANCEL ORDER -->

    <div class="card">

        <h3>Cancel Order</h3>

        <input
                id="cancelOrderId"
                placeholder="Order ID">

        <br><br>

        <button onclick="cancelOrder()">
            Cancel Order
        </button>

    </div>

    <br>

    <!-- ORDER HISTORY -->

    <div class="card">

        <h3>Order History</h3>

        <input
                id="historyUserId"
                placeholder="User ID">

        <br><br>

        <button onclick="loadHistory()">
            Load History
        </button>

    </div>

    <br>

    <!-- TABLE -->

    <div class="card">

        <table border="1" width="100%">

            <thead>

            <tr>

                <th>Order ID</th>

                <th>User ID</th>

                <th>Amount</th>

                <th>Status</th>

                <th>Created</th>

            </tr>

            </thead>

            <tbody id="orderTableBody">

            </tbody>

        </table>

    </div>

    <br>

    <!-- CONSOLE -->

    <div
            id="console"
            class="console">

        [INFO] Orders Console Ready

    </div>

</div>

<script src="/js/orders.js"></script>

</body>

</html>