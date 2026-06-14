async function checkService(name, url) {

    try {

        const response = await fetch(url);

        if (response.ok) {
            return "🟢 " + name + " RUNNING";
        }

        return "🔴 " + name + " DOWN";

    } catch (e) {

        return "🔴 " + name + " DOWN";
    }
}

async function loadServices() {

    const response =
        await fetch("/service-status");

    const data =
        await response.json();

    document.getElementById(
        "serviceConsole"
    ).innerHTML =

        (data.apiGateway === "RUNNING"
            ? "🟢 API Gateway RUNNING"
            : "🔴 API Gateway DOWN")

        + "<br>" +

        "🟢 Product Order RUNNING"

        + "<br>" +

        (data.paymentWallet === "RUNNING"
            ? "🟢 Payment Wallet RUNNING"
            : "🔴 Payment Wallet DOWN")

        + "<br>" +

        (data.authUser === "RUNNING"
            ? "🟢 Auth User RUNNING"
            : "🔴 Auth User DOWN");
}

window.onload = loadServices;

window.onload = function () {

    loadServices();
};