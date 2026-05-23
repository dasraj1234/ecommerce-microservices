async function loadWallet() {

    const userId =
        document.getElementById(
            "walletUserId"
        ).value;

    const response =
        await fetch(
            "http://localhost:8083/wallets/"
            + userId
        );

    const result =
        await response.json();

    document
        .getElementById(
            "walletBalance"
        )
        .innerHTML =
        "₹" + result.balance;
}