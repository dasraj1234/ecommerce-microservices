<%@ page contentType="text/html;charset=UTF-8" %>

<!DOCTYPE html>

<html>

<head>

<title>
E-Commerce Platform
</title>

<link rel="stylesheet"
href="/css/theme.css">

<link rel="stylesheet"
href="/css/widgets.css">

<style>

body{

display:flex;

justify-content:center;

align-items:center;

height:100vh;
}

.container{

width:900px;
}

.portal-grid{

display:grid;

grid-template-columns:1fr 1fr;

gap:30px;

margin-top:30px;
}

.portal-card{

background:white;

padding:40px;

border-radius:20px;

box-shadow:
0 4px 20px rgba(0,0,0,.1);

text-align:center;
}

.portal-card a{

display:inline-block;

margin-top:20px;

padding:12px 25px;

background:#FF8C32;

color:white;

text-decoration:none;

border-radius:10px;
}

</style>

</head>

<body>

<div class="container">

<div class="topbar">

<h1>
E-Commerce Microservices Platform
</h1>

<p>
Product • Order • Payment • Wallet
</p>

</div>

<div id="serviceConsole"
class="console">

Loading Services...

</div>


<div class="portal-grid">

<div class="portal-card">

<h2>
Admin Portal
</h2>

<p>
Manage Products,
Orders,
Payments
</p>

<a href="/admin/dashboard">
Enter
</a>

</div>

<div class="portal-card">

<h2>
Customer Portal
</h2>

<p>
Browse Products,
Place Orders,
Wallet
</p>

<a href="/customer/home">
Enter
</a>

</div>

</div>

</div>
<script src="/js/service-status.js"></script>

</body>

</html>