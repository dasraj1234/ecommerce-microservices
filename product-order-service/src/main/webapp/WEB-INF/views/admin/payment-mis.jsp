<%@ page contentType="text/html;charset=UTF-8"%>

<html>

<head>

<title>Payment MIS</title>

<link rel="stylesheet" href="/css/theme.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/customer.css">
<link rel="stylesheet" href="/css/admin-mis.css">

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

</head>

<body>

<%@ include file="/WEB-INF/views/fragments/admin-sidebar.jsp" %>

<div class="main-content">

<h1>

Payment MIS

</h1>

<br>

<div class="filter-card">

<div class="filter-row">

<div>

<label>

From Date

</label>

<input
type="date"
id="fromDate">

</div>

<div>

<label>

To Date

</label>

<input
type="date"
id="toDate">

</div>

<div>

<label>

Status

</label>

<select id="status">

<option value="ALL">

ALL

</option>

<option value="SUCCESS">

SUCCESS

</option>

<option value="FAILED">

FAILED

</option>

<option value="PENDING">

PENDING

</option>

</select>

</div>

<div>

<label>

Payment Method

</label>

<select id="paymentMethod">

<option value="ALL">

ALL

</option>

<option value="WALLET">

Wallet

</option>

<option value="RAZORPAY">

Razorpay

</option>

</select>

</div>

</div>

<br>

<div class="button-row">

<button onclick="searchMIS()">

Search

</button>

<button onclick="downloadExcel()">

Download Excel

</button>

</div>

</div>

<br>

<div class="summary-grid">

<div class="summary-card">

<h3>Total Payments</h3>

<h1 id="totalPayments">

0

</h1>

</div>

<div class="summary-card">

<h3>Total Amount</h3>

<h1 id="totalAmount">

₹0

</h1>

</div>

<div class="summary-card success">

<h3>Success</h3>

<h1 id="successPayments">

0

</h1>

</div>

<div class="summary-card failed">

<h3>Failed</h3>

<h1 id="failedPayments">

0

</h1>

</div>

</div>

<br>

<div class="table-card">

<table>

<thead>

<tr>

<th>

Payment ID

</th>

<th>

Order ID

</th>

<th>

User ID

</th>

<th>

Amount

</th>

<th>

Method

</th>

<th>

Status

</th>

<th>

Payment Date

</th>

</tr>

</thead>

<tbody id="paymentTable">

</tbody>

</table>

</div>

</div>

<script src="/js/admin-payment-mis.js"></script>

</body>

</html>