async function placeOrder() {

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

    const result =
        await response.json();

    document
    .getElementById(
        "console"
    )
    .innerHTML =
    result.message;
}

window.onload = function () {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const productId =
        params.get("productId");

    const amount =
        params.get("amount");

    if(productId){

        document.getElementById(
            "productId"
        ).value = productId;
    }

    if(amount){

        document.getElementById(
            "totalAmount"
        ).value = amount;
    }
};