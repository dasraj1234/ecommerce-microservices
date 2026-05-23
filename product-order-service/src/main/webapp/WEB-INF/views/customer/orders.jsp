<%@ page contentType="text/html;charset=UTF-8"%>

<html>

<head>

<title>
My Orders
</title>

<link rel="stylesheet"
href="/css/theme.css">

<link rel="stylesheet"
href="/css/layout.css">

<link rel="stylesheet"
href="/css/customer.css">

</head>

<body>

<%@ include file="/WEB-INF/views/fragments/customer-sidebar.jsp" %>

<div class="main-content">

<h1>
Place Order
</h1>

<br>

<div class="card">



<input
id="userId"
placeholder="USER-1001">

<br><br>

<input
id="productId"
readonly
placeholder="Product ID">

<br><br>

<input
id="quantity"
placeholder="Quantity">

<br><br>

<input
id="totalAmount"
readonly
placeholder="Amount">

<br><br>

<button onclick="placeOrder()">

Place Order

</button>

</div>

<br>

<div class="console"
id="console">

Ready

</div>

</div>

<script src="/js/customer-orders.js"></script>

</body>

</html>