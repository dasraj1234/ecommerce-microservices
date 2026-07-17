const API="http://localhost:8082";

window.onload=function(){

const today=new Date();

const first=new Date();

first.setDate(1);

document.getElementById("fromDate").value=
first.toISOString().split("T")[0];

document.getElementById("toDate").value=
today.toISOString().split("T")[0];

searchMIS();

}

async function searchMIS(){

const fromDate=
document.getElementById("fromDate").value;

const toDate=
document.getElementById("toDate").value;

const status=
document.getElementById("status").value;

const paymentMethod=
document.getElementById("paymentMethod").value;

if(fromDate==""){

Swal.fire(

"Validation",

"Please select From Date",

"warning"

);

return;

}

if(toDate==""){

Swal.fire(

"Validation",

"Please select To Date",

"warning"

);

return;

}

if(fromDate>toDate){

Swal.fire(

"Validation",

"From Date cannot be greater than To Date",

"warning"

);

return;

}

const response=
await fetch(

`${API}/admin/payments/mis?fromDate=${fromDate}&toDate=${toDate}&status=${status}&paymentMethod=${paymentMethod}`

);

const result=
await response.json();

let html="";

let total=0;

let success=0;

let failed=0;

result.forEach(p=>{

total+=p.amount;

if(p.status==="SUCCESS")
success++;

if(p.status==="FAILED")
failed++;

html+=`

<tr>

<td>${p.paymentId}</td>

<td>${p.orderId}</td>

<td>${p.userId}</td>

<td>

<b>

₹${Number(p.amount).toLocaleString('en-IN')}

</b>

</td>

<td>${p.paymentMethod}</td>

<td class="${
p.status==="SUCCESS"
?"success-text"
:p.status==="FAILED"
?"failed-text"
:"pending-text"
}">
${p.status}
</td>

<td>${p.paymentDate}</td>

</tr>

`;

});

if(result.length===0){

html=`

<tr>

<td colspan="7">

No Payments Found

</td>

</tr>

`;

}

document.getElementById("paymentTable").innerHTML=html;

document.getElementById("totalPayments").innerHTML=result.length;

document.getElementById("totalAmount").innerHTML="₹"+total.toFixed(2);

document.getElementById("successPayments").innerHTML=success;

document.getElementById("failedPayments").innerHTML=failed;

}

function downloadExcel(){

const fromDate=
document.getElementById("fromDate").value;

const toDate=
document.getElementById("toDate").value;

const status=
document.getElementById("status").value;

const paymentMethod=
document.getElementById("paymentMethod").value;

window.location=

`${API}/admin/payments/mis/download?fromDate=${fromDate}&toDate=${toDate}&status=${status}&paymentMethod=${paymentMethod}`;

}