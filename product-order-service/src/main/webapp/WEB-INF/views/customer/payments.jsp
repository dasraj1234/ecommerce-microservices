<%@ page contentType="text/html;charset=UTF-8"%>

<html>

<head>

<title>
Payments
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
Payment History
</h1>

<br>

<input
id="paymentUserId"
placeholder="USER-1001">

<button onclick="loadPayments()">

Load Payments

</button>

<br><br>

<table class="admin-table">

<thead>

<tr>

<th>Payment ID</th>
<th>Order ID</th>
<th>Amount</th>
<th>Status</th>

</tr>

</thead>

<tbody
id="paymentBody">

</tbody>

</table>

</div>

<script src="/js/customer-payments.js"></script>

</body>

</html>