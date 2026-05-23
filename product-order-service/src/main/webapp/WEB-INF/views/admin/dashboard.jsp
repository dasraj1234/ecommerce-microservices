
<%@ page contentType="text/html;charset=UTF-8"
         pageEncoding="UTF-8"%>
<!DOCTYPE html>

<html>

<head>
<meta charset="UTF-8">
<title>
Admin Dashboard
</title>

<link rel="stylesheet"
href="/css/theme.css">

<link rel="stylesheet"
href="/css/layout.css">

<link rel="stylesheet"
href="/css/widgets.css">

<link rel="stylesheet"
href="/css/admin.css">

</head>

<body>

<%@ include file="/WEB-INF/views/fragments/admin-sidebar.jsp" %>

<div class="main-content">

<div class="page-title">

Admin Dashboard

</div>

<div class="kpi-grid">

<div class="kpi-card">

<div class="kpi-title">
Products
</div>

<div class="kpi-value"
id="productsCount">
--
</div>

</div>

<div class="kpi-card">

<div class="kpi-title">
Orders
</div>

<div class="kpi-value"
id="ordersCount">
--
</div>

</div>

<div class="kpi-card">

<div class="kpi-title">
Payments
</div>

<div class="kpi-value"
id="paymentsCount">
--
</div>

</div>

<div class="kpi-card">

<div class="kpi-title">
Wallet Users
</div>

<div class="kpi-value"
id="walletUsersCount">
--
</div>

</div>

</div>

<div class="card">

<h3>
Service Monitoring
</h3>

<br>

<div id="serviceStatus">

Loading...

</div>

</div>

</div>

<script src="/js/admin-dashboard.js"></script>

</body>

</html>