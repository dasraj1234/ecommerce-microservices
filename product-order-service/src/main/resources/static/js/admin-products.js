async function createProduct() {

    const request = {

        productName:
            document.getElementById(
                "productName"
            ).value,

        category:
            document.getElementById(
                "category"
            ).value,

        price:
            parseFloat(
                document.getElementById(
                    "price"
                ).value
            ),

        stock:
            parseInt(
                document.getElementById(
                    "stock"
                ).value
            )
    };

    const response =
        await fetch(
            "/products/create",
            {
                method:"POST",

                headers:{
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

    document
        .getElementById(
            "console"
        )
        .innerHTML =
        data.message;

    loadProducts();
}

async function loadProducts() {

    const response =
        await fetch(
            "/products/search"
        );

    const result =
        await response.json();

    const tbody =
        document.getElementById(
            "productTableBody"
        );

    tbody.innerHTML = "";

    result.data.forEach(p => {

        tbody.innerHTML +=
        `
        <tr>
            <td>${p.productId}</td>
            <td>${p.productName}</td>
            <td>${p.category}</td>
            <td>${p.price}</td>
            <td>${p.stock}</td>
        </tr>
        `;
    });
}

loadProducts();