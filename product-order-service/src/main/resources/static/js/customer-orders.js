idempotencyKey:
"IDEMP" + Date.now()  //fixed inconsistency 13th june
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
    if(request.paymentMethod === "WALLET"){

   const pinDialog = await Swal.fire({

    title: "Wallet Payment",

    html: `
        <div style="text-align:left">

            <b>User :</b> ${request.userId}

            <br><br>

            Enter your 6 digit Wallet PIN

            <br><br>

            <div style="position:relative;">

                <input
                    id="walletPinInput"
                    type="password"
                    maxlength="6"
                    class="swal2-input"
                    style="margin:0;padding-right:45px;">

                <i
                    id="walletEye"
                    class="fa-solid fa-eye"
                    style="
                        position:absolute;
                        right:18px;
                        top:18px;
                        cursor:pointer;
                        color:#666;
                        font-size:18px;
                    ">
                </i>

            </div>

        </div>
    `,

    focusConfirm: false,

    showCancelButton: true,

    confirmButtonText: "Pay",

    didOpen: () => {

        const input =
            document.getElementById("walletPinInput");

        const eye =
            document.getElementById("walletEye");

        eye.addEventListener("click", () => {

            if(input.type==="password"){

                input.type="text";

                eye.classList.remove("fa-eye");
                eye.classList.add("fa-eye-slash");

            }else{

                input.type="password";

                eye.classList.remove("fa-eye-slash");
                eye.classList.add("fa-eye");

            }

        });

    },

    preConfirm: () => {

        const pin =
            document.getElementById("walletPinInput").value;

        if(pin.length!==6){

            Swal.showValidationMessage(
                "Please enter a 6 digit PIN"
            );

            return false;

        }

        return pin;

    }

});

    if(!pinDialog.isConfirmed){

        button.disabled=false;
        return;

    }

    const paymentResponse =
        await fetch(
            `${API_BASE_URL}/payments/process`,
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    orderId:
                        "ORD-"+Date.now(),

                    userId:
                        request.userId,

                    amount:
                        request.totalAmount,

                    paymentMethod:
                        "WALLET",

                    walletPin:
                        pinDialog.value,

                    idempotencyKey:
                        "IDEMP"+Date.now()

                })

            });

    const payment =
        await paymentResponse.json();

    if(payment.status!=="SUCCESS"){

        Swal.fire({

            icon:"error",

            title:"Wallet Payment Failed",

            text:payment.message

        });

        button.disabled=false;

        return;

    }

    request.paymentId=
        payment.paymentId;

    const orderResponse =
        await fetch(

            `${API_BASE_URL}/orders/create`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(request)

            });

    const result =
        await orderResponse.json();

    document.getElementById("console").innerHTML=

`<div class="success-card">

✅ Order placed successfully

<br><br>

<b>Order ID :</b>

${result.data.orderId}

<br>

<b>Amount :</b>

₹${request.totalAmount}

<br>

<b>Payment :</b>

Wallet

</div>`;

    return;

}
//razorpay integration 12th june
console.log(
    "TOTAL AMOUNT SENT TO RAZORPAY = ",
    request.totalAmount
);

// Generate Internal Order ID from backend

const orderIdResponse =
await fetch(
    `${API_BASE_URL}/orders/generate-order-id`
);

const orderData =
await orderIdResponse.json();

request.orderId =
orderData.orderId;

console.log(
    "OUR ORDER ID =",
    request.orderId
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

body: JSON.stringify({

    userId: request.userId,

    orderId: request.orderId,

    amount: request.totalAmount

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
                            request.orderId,

                            amount:
                            request.totalAmount,
                            //improvements 14th june
                        
    idempotencyKey:
    "IDEMP" + Date.now()
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

let walletRequest = null;

async function showWalletPopup(request){

    walletRequest = request;

    const response =
        await fetch(
            `${API_BASE_URL}/wallet/${request.userId}`
        );

    const wallet =
        await response.json();

    document.getElementById("walletUserId").innerText =
        wallet.userId;

    document.getElementById("walletBalance").innerText =
        wallet.balance;

    document.getElementById("walletAmount").innerText =
        request.totalAmount;

    document.getElementById("walletPin").value = "";

    document.getElementById("walletModal").style.display =
        "flex";

}

function closeWalletModal(){

    document.getElementById("walletModal").style.display =
        "none";

}

async function payUsingWallet(){

    const pin =
        document.getElementById("walletPin").value;

    if(pin.length!==6){

        alert("Enter 6 digit PIN");

        return;

    }

    walletRequest.walletPin = pin;

    const orderIdResponse =
await fetch(
    `${API_BASE_URL}/orders/generate-order-id`
);

const orderData =
await orderIdResponse.json();

walletRequest.orderId =
orderData.orderId;

    const paymentResponse =
        await fetch(

            `${API_BASE_URL}/payments/process`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    orderId:
                    walletRequest.orderId,
                    userId:
                    walletRequest.userId,

                    amount:
                    walletRequest.totalAmount,

                    paymentMethod:
                    "WALLET",

                    walletPin:
                    pin,

                    idempotencyKey:
                    "IDEMP"+Date.now()

                })

            }

        );

    const payment =
        await paymentResponse.json();

    if(payment.status!=="SUCCESS"){

        alert(payment.message);

        return;

    }

    walletRequest.paymentId =
        payment.paymentId;

    const orderResponse =
        await fetch(

            `${API_BASE_URL}/orders/create`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(
                    walletRequest
                )

            }

        );

    const result =
        await orderResponse.json();

    closeWalletModal();

    document.getElementById("console").innerHTML=

`<div class="success-card">

✅ Order placed successfully

<br><br>

<b>Order ID :</b>

${result.data.orderId}

<br>

<b>Amount :</b>

₹${walletRequest.totalAmount}

<br>

<b>Payment :</b>

Wallet

</div>`;

}


};