async function createOrder() {

    try {

        const request = {

            userId:
                document.getElementById(
                    "userId"
                ).value,

            productId:
                document.getElementById(
                    "productId"
                ).value,

            quantity:
                parseInt(
                    document.getElementById(
                        "quantity"
                    ).value
                ),

            totalAmount:
                parseFloat(
                    document.getElementById(
                        "totalAmount"
                    ).value
                )
        };

        const response =
            await fetch(
                "/orders/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(
                            request
                        )
                }
            );

        const data =
            await response.json();

        document.getElementById(
            "console"
        ).innerHTML =
            "[SUCCESS] "
            + data.message;

        console.log(data);

    } catch(error) {

        document.getElementById(
            "console"
        ).innerHTML =
            "[ERROR] "
            + error.message;
    }
}

async function cancelOrder() {

    try {

        const orderId =
            document.getElementById(
                "cancelOrderId"
            ).value;

        const response =
            await fetch(
                "/orders/"
                + orderId
                + "/cancel",
                {
                    method: "PATCH"
                }
            );

        const data =
            await response.json();

        document.getElementById(
            "console"
        ).innerHTML =
            "[SUCCESS] "
            + data.message;

    } catch(error) {

        document.getElementById(
            "console"
        ).innerHTML =
            "[ERROR] "
            + error.message;
    }
}

async function loadHistory() {

    try {

        const userId =
            document.getElementById(
                "historyUserId"
            ).value;

        const response =
            await fetch(
                "/orders/history/"
                + userId
            );

        const result =
            await response.json();

        const tbody =
            document.getElementById(
                "orderTableBody"
            );

        tbody.innerHTML = "";

        result.data.forEach(order => {

            tbody.innerHTML += `

                <tr>

                    <td>${order.orderId}</td>

                    <td>${order.userId}</td>

                    <td>${order.totalAmount}</td>

                    <td>${order.status}</td>

                    <td>${order.createdDate}</td>

                </tr>

            `;
        });

        document.getElementById(
            "console"
        ).innerHTML =
            "[SUCCESS] History loaded";

    } catch(error) {

        document.getElementById(
            "console"
        ).innerHTML =
            "[ERROR] "
            + error.message;
    }
}