async function createOrder() {

    try {

        const userId =
            document.getElementById("userId").value.trim();

        const productId =
            document.getElementById("productId").value.trim();

        const quantity =
            document.getElementById("quantity").value.trim();

        const totalAmount =
            document.getElementById("totalAmount").value.trim();

        if (
            userId === "" ||
            productId === "" ||
            quantity === "" ||
            totalAmount === ""
        ) {

            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please fill all mandatory fields."
            });

            return;
        }

        const request = {

            userId: userId,

            productId: productId,

            quantity: parseInt(quantity),

            totalAmount: parseFloat(totalAmount)
        };

        const response =
            await fetch(
                "${API_BASE_URL}/orders/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(request)
                }
            );

        const data =
            await response.json();

        Swal.fire({
            icon: "success",
            title: "Order Created",
            text: data.message,
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Order Creation Failed",
            text: error.message
        });

    }
}

async function cancelOrder() {

    try {

        const orderId =
            document.getElementById("cancelOrderId").value.trim();

        if (orderId === "") {

            Swal.fire({
                icon: "warning",
                title: "Missing Order ID",
                text: "Please enter Order ID."
            });

            return;
        }

        const response =
            await fetch("/orders/" + orderId + "/cancel", {
                method: "PATCH"
            });

        const data =
            await response.json();

        Swal.fire({
            icon: "success",
            title: "Order Cancelled",
            text: data.message,
            timer: 1800,
            showConfirmButton: false
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Cancellation Failed",
            text: error.message
        });

    }
}

async function loadHistory() {

    try {

        const userId =
            document.getElementById("historyUserId").value.trim();

        if (userId === "") {

            Swal.fire({
                icon: "warning",
                title: "Missing User ID",
                text: "Please enter User ID."
            });

            return;
        }

        const response =
            await fetch("/orders/history/" + userId);

        const result =
            await response.json();

        const tbody =
            document.getElementById("orderTableBody");

        tbody.innerHTML = "";

        if (!result.data || result.data.length === 0) {

            Swal.fire({
                icon: "info",
                title: "No Orders Found",
                text: "No order history found for this user."
            });

            return;
        }

        result.data.forEach(order => {

            let statusBadge = "";

            switch (order.status) {

                case "CONFIRMED":
                    statusBadge =
                        `<span class="status confirmed">CONFIRMED</span>`;
                    break;

                case "PENDING":
                    statusBadge =
                        `<span class="status pending">PENDING</span>`;
                    break;

                case "CANCELLED":
                    statusBadge =
                        `<span class="status cancelled">CANCELLED</span>`;
                    break;

                default:
                    statusBadge =
                        `<span class="status">${order.status}</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.userId}</td>
                    <td>₹${order.totalAmount}</td>
                    <td>${statusBadge}</td>
                    <td>${order.paymentId || "-"}</td>
                    <td>${order.createdDate}</td>
                </tr>
            `;
        });

        Swal.fire({
            icon: "success",
            title: "History Loaded",
            text: "Order history loaded successfully.",
            timer: 1800,
            showConfirmButton: false
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Unable to load order history."
        });

    }
}