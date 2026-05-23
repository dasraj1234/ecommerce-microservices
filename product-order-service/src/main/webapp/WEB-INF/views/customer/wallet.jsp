<%@ page contentType="text/html;charset=UTF-8"%>

<html>

<head>

<title>
Wallet
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
Wallet
</h1>

<br>

<div class="wallet-card">

<h3>
Current Balance
</h3>

<br>

<div class="balance"
id="walletBalance">

₹0

</div>

<br>

<input
id="walletUserId"
placeholder="USER-1001">

<br><br>

<button onclick="loadWallet()">

Check Balance

</button>

</div>

</div>

<script src="/js/customer-wallet.js"></script>

</body>

</html>