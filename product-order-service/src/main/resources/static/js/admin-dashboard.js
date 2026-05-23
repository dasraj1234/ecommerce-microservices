async function loadServices() {

    const response =
        await fetch(
            "/dashboard/services"
        );

    const data =
        await response.json();

    let html = "";

    Object.keys(data)
        .forEach(key => {

            const status =
                data[key];

            html +=
                "<p>"
                + (status === "UP"
                    ? "🟢 "
                    : "🔴 ")
                + key
                + " : "
                + status
                + "</p>";
        });

    document
        .getElementById(
            "serviceStatus"
        )
        .innerHTML =
        html;
}

loadServices();

document
.getElementById(
"productsCount"
)
.innerHTML =
"Live";

document
.getElementById(
"ordersCount"
)
.innerHTML =
"Live";

document
.getElementById(
"paymentsCount"
)
.innerHTML =
"Live";

document
.getElementById(
"walletUsersCount"
)
.innerHTML =
"Live";