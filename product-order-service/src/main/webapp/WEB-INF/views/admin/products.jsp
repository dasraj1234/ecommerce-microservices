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
placeholder="Product Name"
required>

<br><br>

<label>Main Category</label>

<select id="mainCategory" required>

    <option value="">
        Select Main Category
    </option>

</select>

<br><br>

<label>Category</label>

<select id="subCategory" required>

    <option value="">
        Select Category
    </option>

</select>

<br><br>

<label>Sub Category</label>

<select id="leafCategory" required>

    <option value="">
        Select Sub Category
    </option>

</select>

<br><br>

<input
id="price"
type="number"
min="1"
placeholder="Price"
required>

<br><br>

<input
id="stock"
type="number"
min="1"
placeholder="Stock"
required>

<br><br>

<button onclick="createProduct()">
Create Product
</button>

</div>

<div class="card">

    <h3>Search Product</h3>

    <input
        id="searchProductId"
        placeholder="Product ID">

    <br><br>

    <button onclick="searchProduct()">
        Search Product
    </button>

</div>

<br>

<div class="card">

    <h3>Delete Product</h3>

    <input
        id="deleteProductId"
        placeholder="Product ID">

    <br><br>

    <button onclick="deleteProduct()">
        Delete Product
    </button>

</div>

<br>

<br>

<div class="card">

<h3>
Product Catalog
</h3>

<br>

<button onclick="loadProducts(true)">
Refresh Products
</button>

<br><br>

<table class="admin-table">

<thead>

<tr>

<th>Product ID</th>
<th>Name</th>
<th>Main Category</th>
<th>Category</th>
<th>Sub Category</th>
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

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="/js/admin-products.js"></script>
<script src="/js/admin-products.js"></script>

</body>

</html>