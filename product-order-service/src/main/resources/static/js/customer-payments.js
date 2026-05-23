async function loadPayments() {

    const userId =
        document.getElementById(
            "paymentUserId"
        ).value;

    const response =
        await fetch(
            "http://localhost:8083/payments/user/"
            + userId
        );

    const data =
        await response.json();

    const body =
        document.getElementById(
            "paymentBody"
        );

    body.innerHTML = "";

    data.forEach(p => {

        body.innerHTML +=
        `
        <tr>

            <td>${p.paymentId}</td>

            <td>${p.orderId}</td>

            <td>${p.amount}</td>

            <td>${p.status}</td>

        </tr>
        `;
    });
}