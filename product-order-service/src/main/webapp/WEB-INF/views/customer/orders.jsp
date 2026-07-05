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

<!--razorpay integration 12th june !-->
<select id="paymentMethod">
    <option value="RAZORPAY" selected>Razorpay</option>
    <option value="WALLET">Wallet</option>
</select>

<br><br>

<h1>
Place Order
</h1>

<br>

<div class="card">



<input
id="userId"
placeholder="USER-1001">

<br><br>

<div id="productNameDisplay">
Product: Mobile Phone
</div>

<input
id="productId"
type="hidden">

<br><br>

<input
id="quantity"
type="number"
min="1"
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
<script src="https://checkout.razorpay.com/v1/checkout.js"></script> <!--razorpay integration frontend 12th june!-->

</body>

</html>