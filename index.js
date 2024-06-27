import StellarSdk from "@stellar/stellar-sdk"

let server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

function send_payment(sender, receiver, amount) {
    let sourceKeys = StellarSdk.Keypair.fromSecret(sender)
    let destinationId = receiver
    let transaction;

    server
    .loadAccount(destinationId)
    .catch(function (error) {
        if (error instanceof StellarSdk.NotFoundError) {
        throw new Error("The destination account does not exist!");
        } else return error;
    })
    .then(function () {
        return server.loadAccount(sourceKeys.publicKey());
    })
    .then(function (sourceAccount) {
        transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
        }).addOperation(
            StellarSdk.Operation.payment({
            destination: destinationId,
            asset: StellarSdk.Asset.native(),
            amount: amount,
            }),
        )
        .addMemo(StellarSdk.Memo.text("Test Transaction"))
        .setTimeout(180)
        .build();
        transaction.sign(sourceKeys);

        return server.submitTransaction(transaction);
    })
    .then(function (result) {
        console.log("Success! Results:", result);
    })
    .catch(function (error) {
        console.error("Something went wrong!", error);
    });
}

let senders = [
    {
        "sender": "add sender 1's secret key",
        "amount": "100"
    },
    {
        "sender": "add sender 2's secret key",
        "amount": "50"
    }
    // add as many senders as you want
]
let receiver = "receiver's public key"

senders.forEach(sender => {
    send_payment(sender.sender, receiver, sender.amount)
})