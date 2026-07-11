<%@ page contentType="text/html;charset=UTF-8"%>

<html>

<head>

<title>Wallet</title>

<link rel="stylesheet" href="/css/theme.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/customer.css">

</head>

<body>

<%@ include file="/WEB-INF/views/fragments/customer-sidebar.jsp" %>

<div class="main-content">

<h1>Wallet</h1>

<br>

<div class="wallet-card">

<h3>Wallet Details</h3>

<br>

<table>

<tr>
<td><b>User ID</b></td>
<td id="walletUserId">-</td>
</tr>

<tr>
<td><b>Wallet ID</b></td>
<td id="walletId">-</td>
</tr>

<tr>
<td><b>Status</b></td>
<td id="walletStatus">-</td>
</tr>

<tr>
<td><b>Balance</b></td>
<td class="balance" id="walletBalance">₹0</td>
</tr>

<tr>
<td><b>Last Transaction</b></td>
<td id="walletLastTxn">-</td>
</tr>

</table>

</div>

<br><br>

<div class="wallet-card">

<h3>Wallet Transactions</h3>

<br>

<table
class="table"
width="100%">

<thead>

<tr>

<th>Date</th>

<th>Payment ID</th>

<th>Order ID</th>

<th>Type</th>

<th>Amount</th>

<th>Status</th>

</tr>

</thead>

<tbody id="walletHistory">

</tbody>

</table>

</div>

</div>

<script src="/js/customer-wallet.js"></script>

</body>

</html>