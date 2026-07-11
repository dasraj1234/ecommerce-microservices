const API_BASE_URL = "";

/* ==============================
   LOAD MAIN CATEGORIES
============================== */

async function loadMainCategories() {

    try {

        const response =
            await fetch("/categories/level1");

        const categories =
            await response.json();

        const main =
            document.getElementById("mainCategory");

        main.innerHTML =
            "<option value=''>Select Main Category</option>";

        categories.forEach(c => {

            main.innerHTML +=
                `<option value="${c.categoryCode}">
                    ${c.categoryName}
                </option>`;
        });

    } catch (e) {

        Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Unable to load categories."
        });

    }

}

/* ==============================
   LOAD CHILD CATEGORIES
============================== */

async function loadChildren(parentCode, targetId) {

    if (parentCode === "") {

        document.getElementById(targetId).innerHTML =
            "<option value=''>Select</option>";

        return;
    }

    const response =
        await fetch("/categories/children/" + parentCode);

    const categories =
        await response.json();

    const dropdown =
        document.getElementById(targetId);

    dropdown.innerHTML =
        "<option value=''>Select</option>";

    categories.forEach(c => {

        dropdown.innerHTML +=
            `<option value="${c.categoryCode}">
                ${c.categoryName}
            </option>`;

    });

}

/* ==============================
   CREATE PRODUCT
============================== */

async function createProduct() {

    const productName =
        document.getElementById("productName").value.trim();

    const mainCategory =
        document.getElementById("mainCategory").value;

    const subCategory =
        document.getElementById("subCategory").value;

    const leafCategory =
        document.getElementById("leafCategory").value;

    const price =
        document.getElementById("price").value;

    const stock =
        document.getElementById("stock").value;

    if (
        productName === "" ||
        mainCategory === "" ||
        subCategory === "" ||
        leafCategory === "" ||
        price === "" ||
        stock === ""
    ) {

        Swal.fire({
            icon: "warning",
            title: "Missing Information",
            text: "Please fill all mandatory fields."
        });

        return;
    }

    const request = {

        productName,

        categoryCode: leafCategory,

        categoryPath:
            mainCategory + ">" +
            subCategory + ">" +
            leafCategory,

        categoryNamePath:

            document.getElementById("mainCategory").selectedOptions[0].text
            + " > " +
            document.getElementById("subCategory").selectedOptions[0].text
            + " > " +
            document.getElementById("leafCategory").selectedOptions[0].text,

        price: parseFloat(price),

        stock: parseInt(stock)

    };

    try {

        const response =
            await fetch("/products/create", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(request)

            });

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(result.message);

        }

        Swal.fire({

            icon: "success",

            title: "Success",

            text: result.message,

            timer: 1800,

            showConfirmButton: false

        });

        loadProducts();

    } catch (e) {

        Swal.fire({

            icon: "error",

            title: "Failed",

            text: e.message

        });

    }

}

/* ==============================
   LOAD PRODUCTS
============================== */

async function loadProducts(showMessage = false) {

    try {

        const response =
            await fetch("/products");

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(result.message);

        }

        const products =
            result.data;

        const body =
            document.getElementById("productTableBody");

        body.innerHTML = "";

        if (products.length === 0) {

            body.innerHTML =
                `<tr>
                    <td colspan="8" align="center">
                        No Products Found
                    </td>
                </tr>`;

            return;

        }

        products.forEach(product => {

            body.innerHTML +=

                `<tr>

                    <td>${product.productId}</td>

                    <td>${product.productName}</td>

                    <td>${product.category}</td>

                    <td>${product.categoryNamePath}</td>

                    <td>₹${product.price}</td>

                    <td>${product.stock}</td>

                    <td>${product.status}</td>

                </tr>`;

        });

        if (showMessage) {

            Swal.fire({

                icon: "success",

                title: "Loaded",

                text: "Products loaded successfully.",

                timer: 1500,

                showConfirmButton: false

            });

        }

    }

    catch (e) {

        Swal.fire({

            icon: "error",

            title: "Failed",

            text: e.message

        });

    }

}

/* ==============================
   SEARCH PRODUCT
============================== */

async function searchProduct() {

    try {

        const productId =
            document.getElementById("searchProductId").value.trim();

        if (productId === "") {

            Swal.fire({

                icon: "warning",

                title: "Missing Product ID",

                text: "Please enter Product ID."

            });

            return;

        }

        const response =
            await fetch("/products/" + productId);

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(result.message);

        }

        const product =
            result.data;

        const body =
            document.getElementById("productTableBody");

        body.innerHTML =

            `<tr>

                <td>${product.productId}</td>

                <td>${product.productName}</td>

                <td>${product.category}</td>

                <td>${product.categoryNamePath}</td>

                <td>₹${product.price}</td>

                <td>${product.stock}</td>

                <td>${product.status}</td>

            </tr>`;

        Swal.fire({

            icon: "success",

            title: "Product Found",

            timer: 1500,

            showConfirmButton: false

        });

    }

    catch (e) {

        Swal.fire({

            icon: "error",

            title: "Product Not Found",

            text: e.message

        });

    }

}

/* ==============================
   DELETE PRODUCT
============================== */

async function deleteProduct() {

    const productId =
        document.getElementById("deleteProductId").value.trim();

    if (productId === "") {

        Swal.fire({

            icon: "warning",

            title: "Missing Product ID",

            text: "Please enter Product ID."

        });

        return;

    }

    const confirm =
        await Swal.fire({

            title: "Delete Product?",

            text: "This action cannot be undone.",

            icon: "warning",

            showCancelButton: true

        });

    if (!confirm.isConfirmed)
        return;

    try {

        const response =
            await fetch(

                "/products/" + productId,

                {

                    method: "DELETE"

                }

            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(result.message);

        }

        Swal.fire({

            icon: "success",

            title: "Deleted",

            text: result.message,

            timer: 1500,

            showConfirmButton: false

        });

        loadProducts();

    }

    catch (e) {

        Swal.fire({

            icon: "error",

            title: "Delete Failed",

            text: e.message

        });

    }

}

/* ==============================
   EVENTS
============================== */

window.onload = function () {

    loadMainCategories();

    loadProducts();

};

document
.getElementById("mainCategory")
.onchange = function () {

    loadChildren(this.value, "subCategory");

};

document
.getElementById("subCategory")
.onchange = function () {

    loadChildren(this.value, "leafCategory");

};