async function loadProducts() {

    const response =
        await fetch(
            "/products/search"
        );

    const result =
        await response.json();

    const grid =
        document.getElementById(
            "productGrid"
        );

    grid.innerHTML = "";

    result.data.forEach(p => {

        grid.innerHTML +=
        `
        <div class="product-card">

            <div class="product-header">

                <h3>${p.productName}</h3>

            </div>

            <div class="product-body">

                <div class="price">
                    ₹${p.price}
                </div>

                <br>

                <div>
                    Category:
                    ${p.category}
                </div>

                <br>

                <div class="stock">
                    Stock:
                    ${p.stock}
                </div>

                <button
                class="buy-btn"
                onclick="
                location.href=
                '/customer/orders?productId=${p.productId}&amount=${p.price}'
                ">

                Buy Now

                </button>

            </div>

        </div>
        `;
    });
}

loadProducts();