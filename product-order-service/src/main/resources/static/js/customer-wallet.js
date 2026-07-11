const API =
"http://localhost:8080";

window.onload = function(){

    loadWallet();

};

async function loadWallet(){

    // Later replace this with logged-in user

    const userId="USER-1001";

    //-------------------------
    // Wallet Details
    //-------------------------

    const walletResponse =
        await fetch(
            `${API}/wallet/${userId}`
        );

    const wallet =
        await walletResponse.json();

    document.getElementById("walletUserId").innerHTML =
        wallet.userId;

    document.getElementById("walletId").innerHTML =
        wallet.walletId;

    document.getElementById("walletStatus").innerHTML =
        wallet.status;

    document.getElementById("walletBalance").innerHTML =
        "₹"+wallet.balance;

    document.getElementById("walletLastTxn").innerHTML =
        wallet.lastTransactionDate;

    //-------------------------
    // Wallet History
    //-------------------------

    const historyResponse =
        await fetch(
            `${API}/wallet/history/${userId}`
        );

    const history =
        await historyResponse.json();

    let html="";

    history.forEach(tx=>{

        html+=`

<tr>

<td>${tx.transactionDate}</td>

<td>${tx.paymentId ?? "-"}</td>

<td>${tx.orderId ?? "-"}</td>

<td>${tx.transactionType}</td>

<td>₹${tx.amount}</td>

<td>${tx.status}</td>

</tr>

`;

    });

    document.getElementById(
        "walletHistory"
    ).innerHTML=html;

}