<%@ page contentType="text/html;charset=UTF-8" %>

<!DOCTYPE html>

<html>

<head>

<title>
Admin Products
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

Product Management

</div>

<div class="card">

<h3>
Create Product
</h3>

<br>

<input
id="productName"
placeholder="Product Name">

<br><br>

<input
id="category"
placeholder="Category">

<br><br>

<input
id="price"
placeholder="Price">

<br><br>

<input
id="stock"
placeholder="Stock">

<br><br>

<button onclick="createProduct()">
Create Product
</button>

</div>

<br>

<div class="card">

<h3>
Product Catalog
</h3>

<br>

<button onclick="loadProducts()">
Refresh Products
</button>

<br><br>

<table class="admin-table">

<thead>

<tr>

<th>ID</th>
<th>Name</th>
<th>Category</th>
<th>Price</th>
<th>Stock</th>

</tr>

</thead>

<tbody
id="productTableBody">

</tbody>

</table>

</div>

<div class="console"
id="console">

Admin Product Console

</div>

</div>

<script src="/js/admin-products.js"></script>

</body>

</html>