/*
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
            "${API_BASE_URL}/orders/create",
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
    */

idempotencyKey:
"IDEMP-" + Date.now()  //fixed inconsistency 13th june
//improvements 14th june
let unitPrice = 0;

const API_BASE_URL =
    "http://localhost:8080";

const ORDER_BASE_URL =
    "http://localhost:8082";



//new createorder function razorpay integration 12th june
async function placeOrder() {

    const button =
    document.querySelector("button");

button.disabled = true;

    const request = {

        //razorpay integration1 12th june

        userId:
        document.getElementById(
            "userId"
        ).value,

        //razorpay integration1 12th june
        paymentMethod:
document.getElementById(
    "paymentMethod"
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
//improvements 14th june
    if(
    request.quantity <= 0
)
{
    alert(
        "Quantity must be greater than 0"
    );

    button.disabled = false;

    return;
}
//razorpay integration 12th june
const stockResponse =
    await fetch(
        `${API_BASE_URL}/orders/stock/check?productId=${request.productId}&quantity=${request.quantity}`
    );

const stockAvailable =
    await stockResponse.json();

if(!stockAvailable)
{
    document
        .getElementById("console")
        .innerHTML =
        "Insufficient Stock";

    return;
}

//razorpay integration 12th june
    if(request.paymentMethod === "WALLET")
{
    const orderResponse =
        await fetch(
            `${API_BASE_URL}/orders/create`,
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                
                body:JSON.stringify(
                    request
                )
            }
        );
//improvements 14th june
    const result =
        await orderResponse.json();

        console.log(result);
   document
.getElementById("console")
.innerHTML =

`<div class="success-card">

✅ Order placed successfully

<br><br>

<b>Order ID:</b>
${result.data.orderId}

<br>

<b>Amount:</b>
₹${request.totalAmount}

<br>

<b>Payment Method:</b>
${request.paymentMethod}

</div>`;

    return;
}
//razorpay integration 12th june
console.log(
    "TOTAL AMOUNT SENT TO RAZORPAY = ",
    request.totalAmount
);
    const paymentResponse =
        await fetch(
            `${API_BASE_URL}/payments/razorpay/create-order`,
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    userId:
                    request.userId,

                    orderId:
                    "ORD-" +
                    Date.now(),

                    amount:
                    request.totalAmount
                })
            }
        );
        //improvements 14th june

    const paymentData =
        await paymentResponse.json();

    const options = {

        key:
        paymentData.key,

        amount:
        paymentData.amount * 100,

        currency:
        paymentData.currency,

        order_id:
        paymentData.razorpayOrderId,

        name:
        "Ecommerce",

        description:
        "Order Payment",

         modal: {

        ondismiss: function () {

            document
                .getElementById("console")
                .innerHTML =
                "Payment cancelled";

            button.disabled = false;
        }
    },

        handler:
        async function(response) {

            console.log("REQUEST =", request);
console.log("USER ID =", request.userId);

            const verifyResponse =
                await fetch(
                    `${API_BASE_URL}/payments/razorpay/verify`,
                    {
                        method:"POST",

                        headers:{
                            "Content-Type":
                            "application/json"
                        },

                        

                        body:JSON.stringify({

                            razorpayOrderId:
                            response.razorpay_order_id,

                            razorpayPaymentId:
                            response.razorpay_payment_id,

                            razorpaySignature:
                            response.razorpay_signature,

                            //improvements 14th june
                            userId:
                            request.userId,

                            orderId:
                            paymentData.razorpayOrderId,

                            amount:
                            request.totalAmount,
                            //improvements 14th june
                        
    idempotencyKey:
    "IDEMP-" + Date.now()
                        })
                    }
                );
//improvements 14th june
            const verifyResult =
                await verifyResponse.json();

                console.log(
              verifyResult.paymentId
                ); //inconsistency fixed on 13th june

            if(
                verifyResult.status ===
                "SUCCESS"
            ) {

                request.paymentId =
                verifyResult.paymentId;
                const orderResponse =
                    await fetch(
                        `${API_BASE_URL}/orders/create`,
                        {
                            method:"POST",

                            headers:{
                                "Content-Type":
                                "application/json"
                            },

                            body:JSON.stringify(
                                request
                            )
                        }
                    );
                    console.log("PAYMENT VERIFIED");
                    console.log("REQUEST SENT TO ORDER API");
                    console.log(request);

                const result =
                    await orderResponse.json();

                    console.log("ORDER API RESPONSE");
                    console.log(result);
//improvements 14th june
                document
.getElementById("console")
.innerHTML =

`<div class="success-card">

✅ Order placed successfully

<br><br>

<b>Order ID:</b>
${result.data.orderId}

<br>

<b>Amount:</b>
₹${request.totalAmount}

<br>

<b>Payment Method:</b>
${request.paymentMethod}

</div>`;

            } else {

                alert(
                    "Payment verification failed"
                );
            }
        }
    };

    const rzp =
        new Razorpay(options);

    rzp.open();
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

        unitPrice=parseFloat(amount);
        document.getElementById(
            "totalAmount"
        ).value = unitPrice;
    }

    //improvements razorpay 13th june
    document
.getElementById("quantity")
.addEventListener("input", function() {

    const qty =
        parseInt(this.value) || 0;


         const total =
        unitPrice * qty;

    console.log(
        "QTY =", qty,
        "UNIT =", unitPrice,
        "TOTAL =", total
    );
    
    document
        .getElementById("totalAmount")
        .value =
        unitPrice * qty;
});
};