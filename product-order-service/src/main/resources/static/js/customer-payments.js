async function getPaymentsByUser() {

    try {

        const userId =
            document.getElementById("paymentUserId").value.trim();

        if (userId === "") {

            Swal.fire({
                icon: "warning",
                title: "Missing User ID",
                text: "Please enter a User ID."
            });

            return;
        }

        const response =
            await fetch("http://localhost:8080/payments/user/" + userId);

        const data =
            await response.json();

        const body =
            document.getElementById("paymentBody");

        body.innerHTML = "";

        // No records found
        if (!Array.isArray(data) || data.length === 0) {

            Swal.fire({
                icon: "info",
                title: "No Payments Found",
                text: "No payment history exists for this User ID."
            });

            return;
        }

        // Populate table
        data.forEach(p => {

            body.innerHTML += `
            <tr>
                <td>${p.paymentId}</td>
                <td>${p.orderId}</td>
                <td>${p.userId}</td>
                <td>${p.amount}</td>
                <td>${p.status}</td>
                <td>${p.createdDate}</td>
            </tr>`;
        });

        Swal.fire({
            icon: "success",
            title: "Success",
            text: "Payment history loaded successfully.",
            timer: 1500,
            showConfirmButton: false
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Unable to load payment history."
        });
    }
}

async function getPayment() {

    try {

        const paymentId =
            document.getElementById("paymentId").value.trim();

        if (paymentId === "") {

            Swal.fire({
                icon: "warning",
                title: "Missing Payment ID",
                text: "Please enter a Payment ID."
            });

            return;
        }

        const body =
            document.getElementById("paymentBody");

        body.innerHTML = "";

        const response =
            await fetch(
                "http://localhost:8080/payments/" + paymentId
            );

        if (!response.ok) {

            throw new Error("Payment not found.");
        }

        const p =
            await response.json();

        body.innerHTML = `
        <tr>
            <td>${p.paymentId}</td>
            <td>${p.orderId}</td>
            <td>${p.userId}</td>
            <td>₹${p.amount}</td>
            <td>${p.status}</td>
            <td>${p.createdDate}</td>
        </tr>
        `;

        Swal.fire({
            icon: "success",
            title: "Payment Found",
            timer: 1500,
            showConfirmButton: false
        });

    } catch (error) {

        document.getElementById("paymentBody").innerHTML = "";

        Swal.fire({
            icon: "error",
            title: "Payment Not Found",
            text: error.message
        });
    }
}